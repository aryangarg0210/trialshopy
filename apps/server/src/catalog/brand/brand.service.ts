import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CatalogStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateBrandDto } from "./dto/create-brand.dto";
import type { ListBrandsQuery } from "./dto/list-brands.query";
import type { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateBrandDto) {
		await this.assertCategoriesExist(dto.categoryIds);
		return this.prisma.brand.create({ data: dto });
	}

	async update(id: string, dto: UpdateBrandDto) {
		await this.assertExists(id);
		await this.assertCategoriesExist(dto.categoryIds);
		return this.prisma.brand.update({ where: { id }, data: dto });
	}

	async softDelete(id: string) {
		await this.assertExists(id);
		await this.prisma.brand.update({
			where: { id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	async findOne(id: string) {
		const brand = await this.prisma.brand.findUnique({ where: { id } });
		if (!brand) throw new NotFoundException("Brand not found");
		return brand;
	}

	async list(query: ListBrandsQuery) {
		const { page, limit, status, isPopular, categoryId, search } = query;
		const where: Prisma.BrandWhereInput = {};
		if (status) where.status = status;
		if (isPopular !== undefined) where.isPopular = isPopular;
		if (categoryId) where.categoryIds = { has: categoryId };
		if (search) where.name = { contains: search, mode: "insensitive" };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.brand.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.brand.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertExists(id: string) {
		const brand = await this.prisma.brand.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!brand) throw new NotFoundException("Brand not found");
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
