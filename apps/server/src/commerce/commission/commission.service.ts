import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { GenericStatus, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCommissionDto } from "./dto/create-commission.dto";
import type { ListCommissionsQuery } from "./dto/list-commissions.query";
import type { UpdateCommissionDto } from "./dto/update-commission.dto";

@Injectable()
export class CommissionService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCommissionDto) {
		await this.assertProductExists(dto.productId);
		this.assertWindow(dto.datedFrom, dto.datedTo);
		return this.prisma.commission.create({ data: dto });
	}

	list(query: ListCommissionsQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const commission = await this.prisma.commission.findUnique({
			where: { id },
		});
		if (!commission) throw new NotFoundException("Commission not found");
		return commission;
	}

	async update(id: string, dto: UpdateCommissionDto) {
		const commission = await this.getById(id);
		if (dto.productId) await this.assertProductExists(dto.productId);
		this.assertWindow(
			dto.datedFrom ?? commission.datedFrom,
			dto.datedTo ?? commission.datedTo,
		);
		return this.prisma.commission.update({ where: { id }, data: dto });
	}

	async softDelete(id: string) {
		await this.getById(id);
		await this.prisma.commission.update({
			where: { id },
			data: { status: GenericStatus.inactive },
		});
		return { deleted: true };
	}

	async listMine(userId: string, query: ListCommissionsQuery) {
		const productIds = await this.getMyProductIds(userId);
		if (!productIds.length)
			return {
				data: [],
				page: query.page,
				limit: query.limit,
				total: 0,
				totalPages: 0,
			};
		return this.runList(query, productIds);
	}

	async getMineOne(userId: string, id: string) {
		const productIds = await this.getMyProductIds(userId);
		const commission = await this.prisma.commission.findUnique({
			where: { id },
		});
		if (!commission || !productIds.includes(commission.productId))
			throw new NotFoundException("Commission not found");
		return commission;
	}

	private async runList(
		query: ListCommissionsQuery,
		scopeProductIds?: string[],
	) {
		const { page, limit, productId, status, active } = query;
		const where: Prisma.CommissionWhereInput = {};
		if (scopeProductIds) where.productId = { in: scopeProductIds };
		if (productId) where.productId = productId;
		if (status) where.status = status;
		if (active) {
			const now = new Date();
			where.datedFrom = { lte: now };
			where.datedTo = { gte: now };
		}

		const [data, total] = await this.prisma.$transaction([
			this.prisma.commission.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.commission.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private assertWindow(datedFrom: string | Date, datedTo: string | Date) {
		if (new Date(datedFrom) >= new Date(datedTo))
			throw new BadRequestException("datedFrom must be before datedTo");
	}

	private async assertProductExists(productId: string) {
		const count = await this.prisma.product.count({ where: { id: productId } });
		if (!count) throw new BadRequestException("Product does not exist");
	}

	private async getMyProductIds(userId: string) {
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
		const products = await this.prisma.product.findMany({
			where: { storeId: store.id },
			select: { id: true },
		});
		return products.map((p) => p.id);
	}
}
