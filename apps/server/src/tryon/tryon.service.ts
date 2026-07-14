import { InjectQueue } from "@nestjs/bullmq";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../upload/cloudinary.service";
import type { GenerateTryOnDto } from "./dto/generate-tryon.dto";
import { TRYON_JOB, TRYON_QUEUE, type TryOnJobPayload } from "./tryon.types";

/** Allowed data-URI prefixes for person images. */
const ALLOWED_IMAGE_PREFIXES = [
	"data:image/jpeg",
	"data:image/jpg",
	"data:image/png",
	"data:image/webp",
];

/**
 * TryOnService
 *
 * Orchestrator for the Virtual Try-On feature.
 *
 * Responsibilities:
 *  1. Validate incoming request (MIME type, required fields, video rejection)
 *  2. Upload Base64 person image to Cloudinary (if needed) to obtain a public URL
 *  3. Create a VirtualTryOnSession record in MongoDB (status = queued)
 *  4. Enqueue a BullMQ job so the actual AI inference runs asynchronously
 *  5. Expose a query method to retrieve session status / history
 */
@Injectable()
export class TryOnService {
	private readonly logger = new Logger(TryOnService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
		@InjectQueue(TRYON_QUEUE) private readonly tryOnQueue: Queue,
	) {}

	// ── Submit a new try-on request ─────────────────────────────────────────

	async createSession(
		dto: GenerateTryOnDto,
		userId?: string,
	): Promise<{ sessionId: string; status: string }> {
		const { personImage, garmentImage, clothType = "upper", productId } = dto;

		// ── Validation ─────────────────────────────────────────────────────
		if (!personImage || !garmentImage) {
			throw new BadRequestException(
				"Both personImage and garmentImage are required.",
			);
		}

		// Reject video inputs — AI model is photo-only
		if (personImage.startsWith("data:video")) {
			throw new BadRequestException(
				"Video inputs are not supported. Please upload a photo.",
			);
		}

		// Validate MIME for Base64 inputs (URLs pass through)
		if (
			personImage.startsWith("data:") &&
			!ALLOWED_IMAGE_PREFIXES.some((p) => personImage.startsWith(p))
		) {
			throw new BadRequestException(
				"Unsupported image format. Please upload a JPEG, PNG, or WebP image.",
			);
		}

		// ── Cloudinary upload if base64 ─────────────────────────────────────
		let personImageUrl = personImage;
		if (personImage.startsWith("data:image")) {
			this.logger.log("Uploading person image to Cloudinary…");
			personImageUrl = await this.cloudinary.uploadBase64Image(personImage);
			this.logger.log(`Person image uploaded: ${personImageUrl}`);
		}

		// ── Create DB session ───────────────────────────────────────────────
		const session = await this.prisma.virtualTryOnSession.create({
			data: {
				userId: userId ?? null,
				productId: productId ?? null,
				personImageUrl,
				garmentImageUrl: garmentImage,
				clothType,
				status: "queued",
			},
		});

		this.logger.log(`Session created: ${session.id}`);

		// ── Enqueue BullMQ job ──────────────────────────────────────────────
		const payload: TryOnJobPayload = {
			sessionId: session.id,
			personImageUrl,
			garmentImageUrl: garmentImage,
			clothType,
		};

		await this.tryOnQueue.add(TRYON_JOB, payload, {
			// Retry up to 2 times (cold-start HF space wake-up)
			attempts: 2,
			backoff: { type: "fixed", delay: 10_000 },
			removeOnComplete: { age: 86_400 }, // keep completed jobs 24 h
			removeOnFail: { age: 86_400 },
		});

		this.logger.log(`BullMQ job enqueued for session ${session.id}`);

		return {
			sessionId: session.id,
			status: "queued",
		};
	}

	// ── Query sessions ──────────────────────────────────────────────────────

	async getSessionById(sessionId: string, userId: string) {
		const session = await this.prisma.virtualTryOnSession.findUnique({
			where: { id: sessionId },
		});
		// Scope by owner: never reveal another user's session (or its existence).
		if (!session || session.userId !== userId) {
			throw new NotFoundException(`Try-on session ${sessionId} not found.`);
		}
		return session;
	}

	async getSessionsByUser(userId: string, page = 1, limit = 20) {
		const skip = (page - 1) * limit;
		const [data, total] = await this.prisma.$transaction([
			this.prisma.virtualTryOnSession.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			this.prisma.virtualTryOnSession.count({ where: { userId } }),
		]);

		return {
			data,
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		};
	}
}
