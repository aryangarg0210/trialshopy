import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { MeetRequestStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateMeetRequestDto } from "./dto/create-meet-request.dto";
import type { ListMeetRequestsQuery } from "./dto/list-meet-requests.query";

@Injectable()
export class MeetRequestService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateMeetRequestDto) {
		await this.assertStoreActive(dto.storeId);
		await this.assertProductsExist(dto.productIds);
		return this.prisma.meetRequest.create({
			data: {
				userId,
				storeId: dto.storeId,
				purpose: dto.purpose,
				date: new Date(dto.date),
				time: dto.time,
				productIds: dto.productIds ?? [],
			},
		});
	}

	listMine(userId: string, query: ListMeetRequestsQuery) {
		return this.runList(query, { userId });
	}

	async cancelMine(userId: string, id: string) {
		const request = await this.prisma.meetRequest.findUnique({ where: { id } });
		if (!request || request.userId !== userId)
			throw new NotFoundException("Meet request not found");
		return this.prisma.meetRequest.update({
			where: { id },
			data: { status: MeetRequestStatus.cancelled },
		});
	}

	async listIncoming(userId: string, query: ListMeetRequestsQuery) {
		const storeId = await this.getMyStoreId(userId);
		return this.runList(query, { storeId });
	}

	async updateStatus(userId: string, id: string, status: MeetRequestStatus) {
		const storeId = await this.getMyStoreId(userId);
		const request = await this.prisma.meetRequest.findUnique({ where: { id } });
		if (!request || request.storeId !== storeId)
			throw new NotFoundException("Meet request not found");
		return this.prisma.meetRequest.update({ where: { id }, data: { status } });
	}

	private async runList(
		query: ListMeetRequestsQuery,
		scope: { userId?: string; storeId?: string },
	) {
		const { page, limit, status } = query;
		const where: Prisma.MeetRequestWhereInput = { ...scope };
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.meetRequest.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.meetRequest.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertStoreActive(storeId: string) {
		const store = await this.prisma.store.count({
			where: { id: storeId, status: "active" },
		});
		if (!store) throw new NotFoundException("Store not found");
	}

	private async assertProductsExist(productIds?: string[]) {
		if (!productIds?.length) return;
		const ids = [...new Set(productIds)];
		const count = await this.prisma.product.count({
			where: { id: { in: ids } },
		});
		if (count !== ids.length)
			throw new BadRequestException("One or more products do not exist");
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
}
