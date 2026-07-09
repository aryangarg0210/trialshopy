import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { AdminCreateOfferDto } from "./dto/admin-create-offer.dto";
import type { CreateOfferDto } from "./dto/create-offer.dto";
import type { ListOffersQuery } from "./dto/list-offers.query";
import type { UpdateOfferDto } from "./dto/update-offer.dto";

@Injectable()
export class OfferService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateOfferDto) {
		const storeId = await this.getMyStoreId(userId);
		this.assertWindow(dto.validFrom, dto.validUntil);
		await this.assertProductsInStore(dto.applicableProductIds, storeId);
		return this.prisma.offer.create({ data: { ...dto, storeId } });
	}

	async listMine(userId: string, query: ListOffersQuery) {
		const storeId = await this.getMyStoreId(userId);
		return this.runList({ ...query, storeId });
	}

	async getMineOne(userId: string, id: string) {
		return this.assertOwned(userId, id);
	}

	async updateMine(userId: string, id: string, dto: UpdateOfferDto) {
		const offer = await this.assertOwned(userId, id);
		this.assertWindow(
			dto.validFrom ?? offer.validFrom,
			dto.validUntil ?? offer.validUntil,
		);
		await this.assertProductsInStore(
			dto.applicableProductIds,
			offer.storeId as string,
		);
		return this.prisma.offer.update({ where: { id }, data: dto });
	}

	async deleteMine(userId: string, id: string) {
		await this.assertOwned(userId, id);
		await this.prisma.offer.delete({ where: { id } });
		return { deleted: true };
	}

	async adminCreate(dto: AdminCreateOfferDto) {
		if (!dto.storeId && !dto.brandId)
			throw new BadRequestException("An offer must target a store or a brand");
		this.assertWindow(dto.validFrom, dto.validUntil);
		if (dto.storeId) await this.assertStoreExists(dto.storeId);
		if (dto.brandId) await this.assertBrandExists(dto.brandId);
		await this.assertProductsInStore(dto.applicableProductIds, dto.storeId);
		return this.prisma.offer.create({ data: dto });
	}

	async list(query: ListOffersQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const offer = await this.prisma.offer.findUnique({ where: { id } });
		if (!offer) throw new NotFoundException("Offer not found");
		return offer;
	}

	async update(id: string, dto: UpdateOfferDto) {
		const offer = await this.getById(id);
		this.assertWindow(
			dto.validFrom ?? offer.validFrom,
			dto.validUntil ?? offer.validUntil,
		);
		return this.prisma.offer.update({ where: { id }, data: dto });
	}

	async deleteById(id: string) {
		await this.getById(id);
		await this.prisma.offer.delete({ where: { id } });
		return { deleted: true };
	}

	private async runList(query: ListOffersQuery & { storeId?: string }) {
		const { page, limit, storeId, brandId, active } = query;
		const where: Prisma.OfferWhereInput = {};
		if (storeId) where.storeId = storeId;
		if (brandId) where.brandId = brandId;
		if (active) {
			const now = new Date();
			where.validFrom = { lte: now };
			where.validUntil = { gte: now };
		}

		const [data, total] = await this.prisma.$transaction([
			this.prisma.offer.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.offer.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private assertWindow(validFrom: string | Date, validUntil: string | Date) {
		if (new Date(validFrom) >= new Date(validUntil))
			throw new BadRequestException("validFrom must be before validUntil");
	}

	private async assertOwned(userId: string, id: string) {
		const storeId = await this.getMyStoreId(userId);
		const offer = await this.prisma.offer.findUnique({ where: { id } });
		if (!offer || offer.storeId !== storeId)
			throw new NotFoundException("Offer not found");
		return offer;
	}

	private async getMyStoreId(userId: string) {
		const profile = await this.prisma.sellerProfile.findUnique({
			where: { userId },
			select: { id: true },
		});
		if (!profile)
			throw new ForbiddenException(
				"You are not a registered seller. Complete seller registration first.",
			);
		const store = await this.prisma.store.findFirst({
			where: { sellerId: profile.id },
			select: { id: true },
		});
		if (!store)
			throw new NotFoundException(
				"You do not have a store yet. Create your store first.",
			);
		return store.id;
	}

	private async assertStoreExists(storeId: string) {
		const store = await this.prisma.store.count({ where: { id: storeId } });
		if (!store) throw new BadRequestException("Store does not exist");
	}

	private async assertBrandExists(brandId: string) {
		const brand = await this.prisma.brand.count({ where: { id: brandId } });
		if (!brand) throw new BadRequestException("Brand does not exist");
	}

	private async assertProductsInStore(
		productIds: string[] | undefined,
		storeId: string | undefined,
	) {
		if (!productIds?.length) return;
		const ids = [...new Set(productIds)];
		const where: Prisma.ProductWhereInput = { id: { in: ids } };
		if (storeId) where.storeId = storeId;
		const count = await this.prisma.product.count({ where });
		if (count !== ids.length)
			throw new BadRequestException(
				storeId
					? "One or more products do not belong to this store"
					: "One or more products do not exist",
			);
	}
}
