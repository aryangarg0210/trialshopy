import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { type Prisma, ReelAuthorType } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { CommentReelDto } from "./dto/comment-reel.dto";
import type { CreateReelDto } from "./dto/create-reel.dto";
import type { ListReelsQuery } from "./dto/list-reels.query";
import type { ReelReaction } from "./dto/reel-reaction.dto";

@Injectable()
export class ReelsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(
		userId: string,
		role: string | null | undefined,
		dto: CreateReelDto,
	) {
		let authorType: ReelAuthorType =
			role === "seller" ? ReelAuthorType.seller : ReelAuthorType.customer;

		if (dto.storeId) {
			await this.assertOwnsStore(userId, dto.storeId);
			authorType = ReelAuthorType.store;
		}

		return this.prisma.reel.create({
			data: {
				authorId: userId,
				authorType,
				storeId: dto.storeId ?? null,
				video: dto.video,
				caption: dto.caption,
			},
		});
	}

	async findAll(query: ListReelsQuery) {
		return this.runList(query);
	}

	async findByAuthor(authorId: string, query: ListReelsQuery) {
		return this.runList({ ...query, authorId });
	}

	async getById(id: string) {
		const reel = await this.prisma.reel.findUnique({ where: { id } });
		if (!reel) throw new NotFoundException("Reel not found");
		const [withAuthor] = await this.populateAuthors([reel]);
		return withAuthor;
	}

	async remove(id: string, userId: string) {
		const reel = await this.prisma.reel.findUnique({
			where: { id },
			select: { authorId: true },
		});
		if (!reel) throw new NotFoundException("Reel not found");
		if (reel.authorId !== userId)
			throw new ForbiddenException("You can only delete your own reels");
		await this.prisma.reel.delete({ where: { id } });
		return { deleted: true };
	}

	async react(id: string, userId: string, reaction: ReelReaction) {
		await this.assertExists(id);

		const like = { like_ids: { $oid: userId } };
		const dislike = { dislike_ids: { $oid: userId } };
		const update =
			reaction === "like"
				? { $addToSet: like, $pull: dislike }
				: reaction === "dislike"
					? { $addToSet: dislike, $pull: like }
					: { $pull: { ...like, ...dislike } };

		await this.prisma.$runCommandRaw({
			update: "reel",
			updates: [{ q: { _id: { $oid: id } }, u: update }],
		});
		return this.prisma.reel.findUnique({ where: { id } });
	}

	async addComment(id: string, userId: string, dto: CommentReelDto) {
		await this.assertExists(id);
		return this.prisma.reel.update({
			where: { id },
			data: {
				comments: {
					push: { userId, comment: dto.comment, createdAt: new Date() },
				},
			},
		});
	}

	private async runList(query: ListReelsQuery & { authorId?: string }) {
		const { page, limit, authorId } = query;
		const where: Prisma.ReelWhereInput = {};
		if (authorId) where.authorId = authorId;

		const [reels, total] = await this.prisma.$transaction([
			this.prisma.reel.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.reel.count({ where }),
		]);
		return {
			data: await this.populateAuthors(reels),
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		};
	}

	private async assertExists(id: string) {
		const reel = await this.prisma.reel.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!reel) throw new NotFoundException("Reel not found");
	}

	private async assertOwnsStore(userId: string, storeId: string) {
		const profile = await this.prisma.sellerProfile.findUnique({
			where: { userId },
			select: { id: true },
		});
		const store = profile
			? await this.prisma.store.findFirst({
					where: { id: storeId, sellerId: profile.id },
					select: { id: true },
				})
			: null;
		if (!store) throw new BadRequestException("Store does not belong to you");
	}

	private async populateAuthors<T extends { authorId: string }>(reels: T[]) {
		if (!reels.length) return [];
		const authorIds = [...new Set(reels.map((r) => r.authorId))];
		const users = await this.prisma.user.findMany({
			where: { id: { in: authorIds } },
			select: { id: true, name: true, image: true },
		});
		const userMap = new Map(users.map((u) => [u.id, u]));
		return reels.map((reel) => ({
			...reel,
			author: userMap.get(reel.authorId) ?? null,
		}));
	}
}
