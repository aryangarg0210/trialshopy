import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Job } from "bullmq";
import { PrismaService } from "../../prisma/prisma.service";
import { CloudinaryService } from "../cloudinary.service";
import { TryOnBridgeService } from "../tryon-bridge.service";
import {
	TRYON_JOB,
	TRYON_QUEUE,
	TRYON_SESSION_UPDATED_EVENT,
	type TryOnJobPayload,
	type TryOnSessionUpdatedPayload,
} from "../tryon.types";

/**
 * TryOnProcessor
 *
 * BullMQ worker that runs in the background.
 *
 * For each job it:
 *  1. Updates DB session status → running
 *  2. Emits `tryon.session.updated` (running) → WebSocket gateway pushes update
 *  3. Calls TryOnBridgeService.generate() which:
 *      a. Health-checks the Python bridge
 *      b. Submits the request
 *      c. Polls every 5 seconds (up to 6 min)
 *      d. Returns the result URL
 *  4. During polling, forwards intermediate progress over EventEmitter
 *  5. On success: updates DB session → completed, emits `tryon:completed`
 *  6. On failure: updates DB session → failed, emits `tryon:failed`
 *
 * Concurrency is 1 per default (heavy GPU jobs; one at a time).
 */
@Processor(TRYON_QUEUE, { concurrency: 1 })
export class TryOnProcessor extends WorkerHost {
	private readonly logger = new Logger(TryOnProcessor.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly bridge: TryOnBridgeService,
		private readonly cloudinary: CloudinaryService,
		private readonly eventEmitter: EventEmitter2,
	) {
		super();
	}

	async process(job: Job<TryOnJobPayload>): Promise<void> {
		if (job.name !== TRYON_JOB) return;

		const { sessionId, personImageUrl, garmentImageUrl, clothType } =
			job.data;

		this.logger.log(
			`Processing try-on job. sessionId=${sessionId} jobId=${job.id}`,
		);

		// ── Mark session as running ─────────────────────────────────────────
		await this.updateSession(sessionId, {
			status: "running",
			jobId: job.id,
		});

		this.emit(sessionId, {
			sessionId,
			status: "running",
		});

		// ── Call the Python bridge ──────────────────────────────────────────
		try {
			const bridgeResultUrl = await this.bridge.generate(
				personImageUrl,
				garmentImageUrl,
				// Forward intermediate queue progress to WebSocket clients
				({ msg, rank, rankEta }) => {
					this.emit(sessionId, {
						sessionId,
						status: "running",
						progress: { msg, rank, rankEta },
					});
				},
			);

			// ── Download and upload to Cloudinary for permanent storage ───────
			this.logger.log(`Uploading bridge result to Cloudinary: ${bridgeResultUrl}`);
			const permanentResultUrl = await this.cloudinary.uploadExternalImage(bridgeResultUrl);

			// ── Success ─────────────────────────────────────────────────────
			await this.updateSession(sessionId, {
				status: "completed",
				resultUrl: permanentResultUrl,
			});

			this.logger.log(
				`Job completed. sessionId=${sessionId} resultUrl=${permanentResultUrl}`,
			);

			this.emit(sessionId, {
				sessionId,
				status: "completed",
				resultUrl: permanentResultUrl,
			});
		} catch (err: unknown) {
			// ── Failure ─────────────────────────────────────────────────────
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";

			this.logger.error(
				`Job failed. sessionId=${sessionId}: ${errorMessage}`,
			);

			await this.updateSession(sessionId, {
				status: "failed",
				errorMessage,
			});

			this.emit(sessionId, {
				sessionId,
				status: "failed",
				errorMessage,
			});

			// Re-throw so BullMQ marks the job as failed (triggers retry if configured)
			throw err;
		}
	}

	// ── Helpers ─────────────────────────────────────────────────────────────

	private async updateSession(
		sessionId: string,
		data: {
			status: "queued" | "running" | "completed" | "failed";
			jobId?: string;
			resultUrl?: string;
			errorMessage?: string;
		},
	): Promise<void> {
		try {
			await this.prisma.virtualTryOnSession.update({
				where: { id: sessionId },
				data,
			});
		} catch (err: unknown) {
			this.logger.error(
				`Failed to update session ${sessionId}: ${err instanceof Error ? err.message : err}`,
			);
		}
	}

	private emit(
		sessionId: string,
		payload: TryOnSessionUpdatedPayload,
	): void {
		this.eventEmitter.emit(TRYON_SESSION_UPDATED_EVENT, payload);
	}
}
