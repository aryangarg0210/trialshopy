import { Injectable, NotFoundException } from "@nestjs/common";
import { CatalogStatus } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateVariantDto } from "./dto/create-variant.dto";
import type { UpdateVariantDto } from "./dto/update-variant.dto";
import { ProductService } from "./product.service";

@Injectable()
export class VariantService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productService: ProductService,
	) {}

	async add(userId: string, productId: string, dto: CreateVariantDto) {
		await this.productService.assertProductOwned(userId, productId);
		try {
			return await this.prisma.productVariant.create({
				data: { ...dto, productId },
			});
		} catch (error) {
			throw this.productService.toWriteError(error);
		}
	}

	async update(
		userId: string,
		productId: string,
		variantId: string,
		dto: UpdateVariantDto,
	) {
		await this.assertVariant(userId, productId, variantId);
		try {
			return await this.prisma.productVariant.update({
				where: { id: variantId },
				data: dto,
			});
		} catch (error) {
			throw this.productService.toWriteError(error);
		}
	}

	async remove(userId: string, productId: string, variantId: string) {
		await this.assertVariant(userId, productId, variantId);
		await this.prisma.productVariant.update({
			where: { id: variantId },
			data: { status: CatalogStatus.inactive },
		});
		return { deactivated: true };
	}

	private async assertVariant(
		userId: string,
		productId: string,
		variantId: string,
	) {
		await this.productService.assertProductOwned(userId, productId);
		const variant = await this.prisma.productVariant.findUnique({
			where: { id: variantId },
			select: { id: true, productId: true },
		});
		if (!variant || variant.productId !== productId)
			throw new NotFoundException("Variant not found");
	}
}
