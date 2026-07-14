import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { GenericStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateReviewDto } from "./dto/create-review.dto";
import type { ListReviewsQuery } from "./dto/list-reviews.query";
import type { ReviewReaction } from "./dto/review-reaction.dto";
import type { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateReviewDto) {
		await this.assertProductExists(dto.productId);
		const existing = await this.prisma.review.findFirst({
			where: { userId, productId: dto.productId, status: GenericStatus.active },
			select: { id: true },
		});
		if (existing)
			throw new ConflictException("You have already reviewed this product");

		const review = await this.prisma.review.create({
			data: { ...dto, userId },
		});
		await this.recomputeProductRating(dto.productId);
		return review;
	}

	listMine(userId: string, query: ListReviewsQuery) {
		return this.runList({ ...query, userId });
	}

	async updateMine(userId: string, id: string, dto: UpdateReviewDto) {
		const review = await this.assertOwned(userId, id);
		const updated = await this.prisma.review.update({
			where: { id },
			data: dto,
		});
		if (dto.rating !== undefined)
			await this.recomputeProductRating(review.productId);
		return updated;
	}

	async deleteMine(userId: string, id: string) {
		const review = await this.assertOwned(userId, id);
		await this.prisma.review.update({
			where: { id },
			data: { status: GenericStatus.inactive },
		});
		await this.recomputeProductRating(review.productId);
		return { deleted: true };
	}

	async react(userId: string, id: string, reaction: ReviewReaction) {
		const review = await this.prisma.review.findFirst({
			where: { id, status: GenericStatus.active },
			select: { id: true },
		});
		if (!review) throw new NotFoundException("Review not found");

		const like = { like_ids: { $oid: userId } };
		const dislike = { dislike_ids: { $oid: userId } };
		const update =
			reaction === "like"
				? { $addToSet: like, $pull: dislike }
				: reaction === "dislike"
					? { $addToSet: dislike, $pull: like }
					: { $pull: { ...like, ...dislike } };

		await this.prisma.$runCommandRaw({
			update: "review",
			updates: [{ q: { _id: { $oid: id } }, u: update }],
		});
		return this.prisma.review.findUnique({ where: { id } });
	}

	listByProduct(productId: string, query: ListReviewsQuery) {
		return this.runList({ ...query, productId, status: GenericStatus.active });
	}

	list(query: ListReviewsQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const review = await this.prisma.review.findUnique({ where: { id } });
		if (!review) throw new NotFoundException("Review not found");
		return review;
	}

	async moderate(id: string, status: GenericStatus) {
		const review = await this.getById(id);
		const updated = await this.prisma.review.update({
			where: { id },
			data: { status },
		});
		await this.recomputeProductRating(review.productId);
		return updated;
	}

	async deleteById(id: string) {
		const review = await this.getById(id);
		await this.prisma.review.delete({ where: { id } });
		await this.recomputeProductRating(review.productId);
		return { deleted: true };
	}

	private async runList(query: ListReviewsQuery) {
		const { page, limit, productId, userId, status } = query;
		const where: Prisma.ReviewWhereInput = {};
		if (productId) where.productId = productId;
		if (userId) where.userId = userId;
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.review.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.review.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertOwned(userId: string, id: string) {
		const review = await this.prisma.review.findUnique({ where: { id } });
		if (
			!review ||
			review.userId !== userId ||
			review.status !== GenericStatus.active
		)
			throw new NotFoundException("Review not found");
		return review;
	}

	private async assertProductExists(productId: string) {
		const product = await this.prisma.product.count({
			where: { id: productId, status: "active" },
		});
		if (!product) throw new NotFoundException("Product not found");
	}

	private async recomputeProductRating(productId: string) {
		const agg = await this.prisma.review.aggregate({
			where: { productId, status: GenericStatus.active },
			_avg: { rating: true },
			_count: true,
		});
		await this.prisma.product.update({
			where: { id: productId },
			data: {
				rating: { set: { count: agg._count, average: agg._avg.rating ?? 0 } },
			},
		});
	}
}
