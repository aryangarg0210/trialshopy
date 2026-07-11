import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CatalogStatus, type Category, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { BrowseCategoriesQuery } from "../browse/dto/browse-categories.query";
import type { CreateCategoryDto } from "./dto/create-category.dto";
import type { ListCategoriesQuery } from "./dto/list-categories.query";
import type { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCategoryDto) {
		if (dto.parentId) await this.assertExists(dto.parentId);
		return this.prisma.category.create({ data: dto });
	}

	async update(id: string, dto: UpdateCategoryDto) {
		await this.assertExists(id);
		if (dto.parentId) {
			if (dto.parentId === id)
				throw new BadRequestException("A category cannot be its own parent");
			await this.assertExists(dto.parentId);
			await this.assertNoCycle(id, dto.parentId);
		}
		return this.prisma.category.update({ where: { id }, data: dto });
	}

	async softDelete(id: string) {
		await this.assertExists(id);
		await this.prisma.category.update({
			where: { id },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	async findOne(id: string) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			include: { parent: true, children: true },
		});
		if (!category) throw new NotFoundException("Category not found");
		return category;
	}

	async list(query: ListCategoriesQuery) {
		const { page, limit, parentId, status, featured, search } = query;
		const where: Prisma.CategoryWhereInput = {};
		if (parentId === "null")
			where.OR = [{ parentId: null }, { parentId: { isSet: false } }];
		else if (parentId !== undefined) where.parentId = parentId;
		if (status) where.status = status;
		if (featured !== undefined) where.featured = featured;
		if (search) where.name = { contains: search, mode: "insensitive" };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.category.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.category.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async tree() {
		const categories = await this.prisma.category.findMany({
			orderBy: { name: "asc" },
		});
		return this.assembleTree(categories);
	}

	async browsePublic(query: BrowseCategoriesQuery) {
		const { page, limit, parentId, featured, search } = query;
		const where: Prisma.CategoryWhereInput = { status: CatalogStatus.active };
		if (parentId === "null")
			where.OR = [{ parentId: null }, { parentId: { isSet: false } }];
		else if (parentId) where.parentId = parentId;
		if (featured !== undefined) where.featured = featured;
		if (search) where.name = { contains: search, mode: "insensitive" };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.category.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { name: "asc" },
			}),
			this.prisma.category.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async publicTree() {
		const categories = await this.prisma.category.findMany({
			where: { status: CatalogStatus.active },
			orderBy: { name: "asc" },
		});
		return this.assembleTree(categories);
	}

	private assembleTree(categories: Category[]) {
		const byParent = new Map<string | null, Category[]>();
		for (const category of categories) {
			const key = category.parentId ?? null;
			const siblings = byParent.get(key) ?? [];
			siblings.push(category);
			byParent.set(key, siblings);
		}

		const build = (
			parentId: string | null,
		): (Category & {
			children: unknown[];
		})[] =>
			(byParent.get(parentId) ?? []).map((category) => ({
				...category,
				children: build(category.id),
			}));

		return build(null);
	}

	private async assertExists(id: string) {
		const category = await this.prisma.category.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!category) throw new NotFoundException("Category not found");
	}

	private async assertNoCycle(id: string, newParentId: string) {
		let cursor: string | null = newParentId;
		while (cursor) {
			if (cursor === id)
				throw new BadRequestException(
					"Cannot set parent to a descendant category",
				);
			const parent = await this.prisma.category.findUnique({
				where: { id: cursor },
				select: { parentId: true },
			});
			cursor = parent?.parentId ?? null;
		}
	}
}
