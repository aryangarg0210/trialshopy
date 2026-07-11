import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CloudinaryService } from "../upload/cloudinary.service";
import { CreateReelDto } from "./dto/create-reel.dto";
import { CommentReelDto } from "./dto/comment-reel.dto";
import { ReelAuthorType } from "@repo/db";

@Injectable()
export class ReelsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cloudinary: CloudinaryService,
	) {}

	async createReel(
		userId: string,
		authorType: ReelAuthorType,
		videoBuffer: Buffer,
		createReelDto: CreateReelDto,
	) {
		const videoUrl = await this.cloudinary.uploadVideo(videoBuffer);

		return this.prisma.reel.create({
			data: {
				authorId: userId,
				authorType,
				video: videoUrl,
				caption: createReelDto.caption,
			},
		});
	}

	async findAll(page = 1, limit = 10) {
		const skip = (page - 1) * limit;

		const [reels, total] = await Promise.all([
			this.prisma.reel.findMany({
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.reel.count(),
		]);

		const populatedReels = await this.populateAuthors(reels);

		return {
			data: populatedReels,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findByAuthor(authorId: string, page = 1, limit = 10) {
		const skip = (page - 1) * limit;

		const [reels, total] = await Promise.all([
			this.prisma.reel.findMany({
				where: { authorId },
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.reel.count({ where: { authorId } }),
		]);

		const populatedReels = await this.populateAuthors(reels);

		return {
			data: populatedReels,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async deleteReel(id: string, userId: string) {
		const reel = await this.prisma.reel.findUnique({ where: { id } });
		if (!reel) {
			throw new NotFoundException("Reel not found");
		}

		if (reel.authorId !== userId) {
			throw new ForbiddenException("You can only delete your own reels");
		}

		return this.prisma.reel.delete({ where: { id } });
	}

	async toggleLike(id: string, userId: string) {
		const reel = await this.prisma.reel.findUnique({ where: { id } });
		if (!reel) {
			throw new NotFoundException("Reel not found");
		}

		const isLiked = reel.likeIds.includes(userId);
		
		if (isLiked) {
			return this.prisma.reel.update({
				where: { id },
				data: { likeIds: { set: reel.likeIds.filter((uid) => uid !== userId) } },
			});
		}
		
		return this.prisma.reel.update({
			where: { id },
			data: { likeIds: { push: userId } },
		});
	}

	async toggleDislike(id: string, userId: string) {
		const reel = await this.prisma.reel.findUnique({ where: { id } });
		if (!reel) {
			throw new NotFoundException("Reel not found");
		}

		const isDisliked = reel.dislikeIds.includes(userId);
		
		if (isDisliked) {
			return this.prisma.reel.update({
				where: { id },
				data: { dislikeIds: { set: reel.dislikeIds.filter((uid) => uid !== userId) } },
			});
		}
		
		return this.prisma.reel.update({
			where: { id },
			data: { dislikeIds: { push: userId } },
		});
	}

	async addComment(id: string, userId: string, dto: CommentReelDto) {
		const reel = await this.prisma.reel.findUnique({ where: { id } });
		if (!reel) {
			throw new NotFoundException("Reel not found");
		}

		return this.prisma.reel.update({
			where: { id },
			data: {
				comments: {
					push: {
						userId,
						comment: dto.comment,
						createdAt: new Date(),
					},
				},
			},
		});
	}

	// Helper to manually fetch and attach user details since authorId is loosely typed in DB
	private async populateAuthors(reels: any[]) {
		if (!reels.length) return [];

		// Extract all unique author IDs
		const authorIds = [...new Set(reels.map((r) => r.authorId))];

		// Fetch basic user data for all authors
		const users = await this.prisma.user.findMany({
			where: { id: { in: authorIds } },
			select: { id: true, name: true, email: true, image: true, role: true },
		});

		const userMap = new Map(users.map((u) => [u.id, u]));

		return reels.map((reel) => ({
			...reel,
			author: userMap.get(reel.authorId) || null,
		}));
	}
}
