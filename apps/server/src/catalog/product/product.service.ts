import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CatalogStatus, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { ListProductsQuery } from "./dto/list-products.query";
import type { UpdateProductDto } from "./dto/update-product.dto";

type ProductRefs = Pick<
	CreateProductDto,
	"brandId" | "categoryId" | "categoryIds"
>;

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateProductDto) {
		const store = await this.getMyStore(userId);
		await this.assertRefsExist(dto);
		const { variants, ...data } = dto;
		try {
			return await this.prisma.product.create({
				data: {
					...data,
					storeId: store.id,
					sellerId: store.sellerId,
					variants: variants?.length ? { create: variants } : undefined,
				},
				include: { variants: true },
			});
		} catch (error) {
			throw this.toWriteError(error);
		}
	}

	async listMine(userId: string, query: ListProductsQuery) {
		const store = await this.getMyStore(userId);
		const where = this.buildWhere({ ...query, storeId: store.id });
		return this.runList(where, query);
	}

	async getMineOne(userId: string, id: string) {
		await this.assertProductOwned(userId, id);
		return this.findDetail(id);
	}

	async updateMine(userId: string, id: string, dto: UpdateProductDto) {
		await this.assertProductOwned(userId, id);
		await this.assertRefsExist(dto);
		try {
			return await this.prisma.product.update({
				where: { id },
				data: dto,
				include: { variants: true },
			});
		} catch (error) {
			throw this.toWriteError(error);
		}
	}

	async softDeleteMine(userId: string, id: string) {
		await this.assertProductOwned(userId, id);
		await this.prisma.product.update({
			where: { id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	async list(query: ListProductsQuery) {
		return this.runList(this.buildWhere(query), query);
	}

	async getById(id: string) {
		return this.findDetail(id);
	}

	async update(id: string, dto: UpdateProductDto) {
		await this.assertExists(id);
		await this.assertRefsExist(dto);
		try {
			return await this.prisma.product.update({
				where: { id },
				data: dto,
				include: { variants: true },
			});
		} catch (error) {
			throw this.toWriteError(error);
		}
	}

	async softDeleteById(id: string) {
		await this.assertExists(id);
		await this.prisma.product.update({
			where: { id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	async assertProductOwned(userId: string, productId: string) {
		const store = await this.getMyStore(userId);
		const product = await this.prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, storeId: true },
		});
		if (!product || product.storeId !== store.id)
			throw new NotFoundException("Product not found");
		return product;
	}

	toWriteError(error: unknown) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		)
			return new ConflictException("A variant with this SKU already exists");
		return error;
	}

	private async runList(
		where: Prisma.ProductWhereInput,
		{ page, limit }: ListProductsQuery,
	) {
		const [data, total] = await this.prisma.$transaction([
			this.prisma.product.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.product.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private buildWhere(query: ListProductsQuery): Prisma.ProductWhereInput {
		const { status, brandId, categoryId, storeId, sellerId, search } = query;
		const where: Prisma.ProductWhereInput = {};
		if (status) where.status = status;
		if (brandId) where.brandId = brandId;
		if (storeId) where.storeId = storeId;
		if (sellerId) where.sellerId = sellerId;
		if (search) where.productName = { contains: search, mode: "insensitive" };
		if (categoryId)
			where.OR = [{ categoryId }, { categoryIds: { has: categoryId } }];
		return where;
	}

	private async findDetail(id: string) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: { variants: true },
		});
		if (!product) throw new NotFoundException("Product not found");
		return product;
	}

	private async getMyStore(userId: string) {
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
			select: { id: true, sellerId: true },
		});
		if (!store)
			throw new NotFoundException(
				"You do not have a store yet. Create your store first.",
			);
		return store;
	}

	private async assertExists(id: string) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!product) throw new NotFoundException("Product not found");
	}

	private async assertRefsExist(dto: ProductRefs) {
		if (dto.brandId) {
			const brand = await this.prisma.brand.count({
				where: { id: dto.brandId },
			});
			if (!brand) throw new BadRequestException("Brand does not exist");
		}
		const categoryIds = [
			...new Set([
				...(dto.categoryId ? [dto.categoryId] : []),
				...(dto.categoryIds ?? []),
			]),
		];
		if (categoryIds.length) {
			const count = await this.prisma.category.count({
				where: { id: { in: categoryIds } },
			});
			if (count !== categoryIds.length)
				throw new BadRequestException("One or more categories do not exist");
		}
	}
}
