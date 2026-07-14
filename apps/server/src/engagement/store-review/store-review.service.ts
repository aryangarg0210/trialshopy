import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { GenericStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateStoreReviewDto } from "./dto/create-store-review.dto";
import type { ListStoreReviewsQuery } from "./dto/list-store-reviews.query";
import type { UpdateStoreReviewDto } from "./dto/update-store-review.dto";

@Injectable()
export class StoreReviewService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateStoreReviewDto) {
		await this.assertStoreExists(dto.storeId);
		const existing = await this.prisma.storeReview.findFirst({
			where: { userId, storeId: dto.storeId, status: GenericStatus.active },
			select: { id: true },
		});
		if (existing)
			throw new ConflictException("You have already reviewed this store");

		const review = await this.prisma.storeReview.create({
			data: { ...dto, userId },
		});
		await this.recomputeStoreRating(dto.storeId);
		return review;
	}

	listMine(userId: string, query: ListStoreReviewsQuery) {
		return this.runList({ ...query, userId });
	}

	async updateMine(userId: string, id: string, dto: UpdateStoreReviewDto) {
		const review = await this.assertOwned(userId, id);
		const updated = await this.prisma.storeReview.update({
			where: { id },
			data: dto,
		});
		if (dto.rating !== undefined)
			await this.recomputeStoreRating(review.storeId);
		return updated;
	}

	async deleteMine(userId: string, id: string) {
		const review = await this.assertOwned(userId, id);
		await this.prisma.storeReview.update({
			where: { id },
			data: { status: GenericStatus.inactive },
		});
		await this.recomputeStoreRating(review.storeId);
		return { deleted: true };
	}

	listByStore(storeId: string, query: ListStoreReviewsQuery) {
		return this.runList({ ...query, storeId, status: GenericStatus.active });
	}

	list(query: ListStoreReviewsQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const review = await this.prisma.storeReview.findUnique({ where: { id } });
		if (!review) throw new NotFoundException("Store review not found");
		return review;
	}

	async moderate(id: string, status: GenericStatus) {
		const review = await this.getById(id);
		const updated = await this.prisma.storeReview.update({
			where: { id },
			data: { status },
		});
		await this.recomputeStoreRating(review.storeId);
		return updated;
	}

	async deleteById(id: string) {
		const review = await this.getById(id);
		await this.prisma.storeReview.delete({ where: { id } });
		await this.recomputeStoreRating(review.storeId);
		return { deleted: true };
	}

	private async runList(query: ListStoreReviewsQuery) {
		const { page, limit, storeId, userId, status } = query;
		const where: Prisma.StoreReviewWhereInput = {};
		if (storeId) where.storeId = storeId;
		if (userId) where.userId = userId;
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.storeReview.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.storeReview.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertOwned(userId: string, id: string) {
		const review = await this.prisma.storeReview.findUnique({ where: { id } });
		if (
			!review ||
			review.userId !== userId ||
			review.status !== GenericStatus.active
		)
			throw new NotFoundException("Store review not found");
		return review;
	}

	private async assertStoreExists(storeId: string) {
		const store = await this.prisma.store.count({
			where: { id: storeId, status: "active" },
		});
		if (!store) throw new NotFoundException("Store not found");
	}

	private async recomputeStoreRating(storeId: string) {
		const agg = await this.prisma.storeReview.aggregate({
			where: { storeId, status: GenericStatus.active },
			_avg: { rating: true },
			_count: true,
		});
		await this.prisma.store.update({
			where: { id: storeId },
			data: {
				rating: { set: { count: agg._count, average: agg._avg.rating ?? 0 } },
				reviewCount: agg._count,
			},
		});
	}
}
