import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { ListSubOrdersQuery } from "./dto/list-suborders.query";
import type { UpdateSubOrderDto } from "./dto/update-suborder.dto";

@Injectable()
export class SubOrderService {
	constructor(private readonly prisma: PrismaService) {}

	async listMine(userId: string, query: ListSubOrdersQuery) {
		const sellerId = await this.getSellerProfileId(userId);
		const { page, limit, status } = query;
		const where: Prisma.SubOrderWhereInput = { sellerId };
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.subOrder.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.subOrder.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async update(userId: string, id: string, dto: UpdateSubOrderDto) {
		const sellerId = await this.getSellerProfileId(userId);
		const suborder = await this.prisma.subOrder.findUnique({ where: { id } });
		if (!suborder || suborder.sellerId !== sellerId)
			throw new NotFoundException("Sub-order not found");

		const data: Prisma.SubOrderUpdateInput = {};
		if (dto.status) data.status = dto.status;
		if (dto.deliveryStatus) data.deliveryStatus = dto.deliveryStatus;
		if (dto.deliveryPartner !== undefined)
			data.deliveryPartner = dto.deliveryPartner;
		if (dto.deliveryPrice !== undefined) {
			data.deliveryPrice = dto.deliveryPrice;
			data.totalAfterDelivery = (suborder.finalPrice ?? 0) + dto.deliveryPrice;
		}
		if (dto.stage)
			data.statusUpdates = {
				set: [
					...suborder.statusUpdates,
					{ stage: dto.stage, timestamp: new Date() },
				],
			};

		return this.prisma.subOrder.update({ where: { id }, data });
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
}
