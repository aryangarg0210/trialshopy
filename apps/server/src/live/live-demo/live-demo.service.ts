import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateLiveDemoDto } from "./dto/create-live-demo.dto";
import type { ListLiveDemosQuery } from "./dto/list-live-demos.query";

@Injectable()
export class LiveDemoService {
	constructor(private readonly prisma: PrismaService) {}

	async start(userId: string, dto: CreateLiveDemoDto) {
		if (dto.storeId) await this.assertStoreActive(dto.storeId);
		await this.assertProductsExist(dto.itemIds);
		return this.prisma.liveDemo.create({
			data: {
				customerId: userId,
				storeId: dto.storeId ?? null,
				itemIds: dto.itemIds ?? [],
			},
		});
	}

	async listMine(userId: string, query: ListLiveDemosQuery) {
		const { page, limit, active } = query;
		const where: Prisma.LiveDemoWhereInput = { customerId: userId };
		if (active) where.endTime = null;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.liveDemo.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { startTime: "desc" },
			}),
			this.prisma.liveDemo.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	getMineOne(userId: string, id: string) {
		return this.assertOwned(userId, id);
	}

	async setItems(userId: string, id: string, itemIds: string[]) {
		await this.assertOwned(userId, id);
		await this.assertProductsExist(itemIds);
		return this.prisma.liveDemo.update({
			where: { id },
			data: { itemIds },
		});
	}

	async end(userId: string, id: string) {
		const demo = await this.assertOwned(userId, id);
		if (demo.endTime)
			throw new BadRequestException("This demo session has already ended");
		return this.prisma.liveDemo.update({
			where: { id },
			data: { endTime: new Date() },
		});
	}

	private async assertOwned(userId: string, id: string) {
		const demo = await this.prisma.liveDemo.findUnique({ where: { id } });
		if (!demo || demo.customerId !== userId)
			throw new NotFoundException("Live demo session not found");
		return demo;
	}

	private async assertStoreActive(storeId: string) {
		const store = await this.prisma.store.count({
			where: { id: storeId, status: "active" },
		});
		if (!store) throw new NotFoundException("Store not found");
	}

	private async assertProductsExist(itemIds?: string[]) {
		if (!itemIds?.length) return;
		const ids = [...new Set(itemIds)];
		const count = await this.prisma.product.count({
			where: { id: { in: ids } },
		});
		if (count !== ids.length)
			throw new BadRequestException("One or more products do not exist");
	}
}
