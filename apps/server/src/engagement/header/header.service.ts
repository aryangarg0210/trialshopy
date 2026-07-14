import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateHeaderDto } from "./dto/create-header.dto";
import type { UpdateHeaderDto } from "./dto/update-header.dto";

@Injectable()
export class HeaderService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateHeaderDto) {
		await this.assertRefs(dto.productIds, dto.subcategoryId);
		return this.prisma.header.create({ data: dto });
	}

	findBySubcategory(subcategoryId: string) {
		return this.prisma.header.findMany({
			where: { subcategoryId },
			orderBy: { createdAt: "desc" },
		});
	}

	list() {
		return this.prisma.header.findMany({ orderBy: { createdAt: "desc" } });
	}

	async findOne(id: string) {
		const header = await this.prisma.header.findUnique({ where: { id } });
		if (!header) throw new NotFoundException("Header not found");
		return header;
	}

	async update(id: string, dto: UpdateHeaderDto) {
		await this.findOne(id);
		await this.assertRefs(dto.productIds, dto.subcategoryId);
		return this.prisma.header.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.header.delete({ where: { id } });
		return { deleted: true };
	}

	private async assertRefs(productIds?: string[], subcategoryId?: string) {
		if (productIds?.length) {
			const ids = [...new Set(productIds)];
			const count = await this.prisma.product.count({
				where: { id: { in: ids } },
			});
			if (count !== ids.length)
				throw new BadRequestException("One or more products do not exist");
		}
		if (subcategoryId) {
			const category = await this.prisma.category.count({
				where: { id: subcategoryId },
			});
			if (!category)
				throw new BadRequestException("Subcategory does not exist");
		}
	}
}
