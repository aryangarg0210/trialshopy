import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CatalogStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateStoreDto } from "./dto/create-store.dto";
import type { ListStoresQuery } from "./dto/list-stores.query";
import type { UpdateStoreDto } from "./dto/update-store.dto";
import type { UpdateVerificationDto } from "./dto/update-verification.dto";

@Injectable()
export class StoreService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateStoreDto) {
		const sellerId = await this.getSellerProfileId(userId);
		const existing = await this.prisma.store.findFirst({
			where: { sellerId },
			select: { id: true },
		});
		if (existing) throw new ConflictException("You already have a store");
		await this.assertCategoriesExist(dto.categoryIds);
		return this.prisma.store.create({ data: { ...dto, sellerId } });
	}

	async getMine(userId: string) {
		const sellerId = await this.getSellerProfileId(userId);
		const store = await this.prisma.store.findFirst({ where: { sellerId } });
		if (!store) throw new NotFoundException("You do not have a store yet");
		return store;
	}

	async updateMine(userId: string, dto: UpdateStoreDto) {
		const store = await this.getMine(userId);
		await this.assertCategoriesExist(dto.categoryIds);
		return this.prisma.store.update({ where: { id: store.id }, data: dto });
	}

	async softDeleteMine(userId: string) {
		const store = await this.getMine(userId);
		await this.prisma.store.update({
			where: { id: store.id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	async list(query: ListStoresQuery) {
		const { page, limit, status, verification, sellerId, categoryId, search } =
			query;
		const where: Prisma.StoreWhereInput = {};
		if (status) where.status = status;
		if (verification) where.verification = verification;
		if (sellerId) where.sellerId = sellerId;
		if (categoryId) where.categoryIds = { has: categoryId };
		if (search) where.storeName = { contains: search, mode: "insensitive" };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.store.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.store.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const store = await this.prisma.store.findUnique({ where: { id } });
		if (!store) throw new NotFoundException("Store not found");
		return store;
	}

	async setVerification(id: string, dto: UpdateVerificationDto) {
		await this.assertExists(id);
		return this.prisma.store.update({
			where: { id },
			data: { verification: dto.verification },
		});
	}

	async softDeleteById(id: string) {
		await this.assertExists(id);
		await this.prisma.store.update({
			where: { id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	private async getSellerProfileId(userId: string) {
		const profile = await this.prisma.sellerProfile.findUnique({
			where: { userId },
			select: { id: true },
		});
		if (!profile)
			throw new ForbiddenException(
				"You are not a registered seller. Complete seller registration first.",
			);
		return profile.id;
	}

	private async assertExists(id: string) {
		const store = await this.prisma.store.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!store) throw new NotFoundException("Store not found");
	}

	private async assertCategoriesExist(categoryIds?: string[]) {
		if (!categoryIds?.length) return;
		const ids = [...new Set(categoryIds)];
		const count = await this.prisma.category.count({
			where: { id: { in: ids } },
		});
		if (count !== ids.length)
			throw new BadRequestException("One or more categories do not exist");
	}
}
