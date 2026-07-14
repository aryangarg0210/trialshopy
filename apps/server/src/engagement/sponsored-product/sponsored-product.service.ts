import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateSponsoredProductDto } from "./dto/create-sponsored-product.dto";

@Injectable()
export class SponsoredProductService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateSponsoredProductDto) {
		const product = await this.prisma.product.count({
			where: { id: dto.productId },
		});
		if (!product) throw new BadRequestException("Product does not exist");

		const categories = await this.prisma.category.count({
			where: { id: { in: [dto.categoryId, dto.subcategoryId] } },
		});
		if (categories !== new Set([dto.categoryId, dto.subcategoryId]).size)
			throw new BadRequestException("Category or subcategory does not exist");

		return this.prisma.sponsoredProduct.create({ data: dto });
	}

	findAll() {
		return this.prisma.sponsoredProduct.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	findBySubcategory(subcategoryId: string) {
		return this.prisma.sponsoredProduct.findMany({
			where: { subcategoryId },
			take: 2,
			orderBy: { createdAt: "desc" },
		});
	}

	async remove(id: string) {
		const sponsored = await this.prisma.sponsoredProduct.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!sponsored) throw new NotFoundException("Sponsored product not found");
		await this.prisma.sponsoredProduct.delete({ where: { id } });
		return { deleted: true };
	}
}
