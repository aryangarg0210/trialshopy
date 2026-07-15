import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateMeetingDto } from "./dto/create-meeting.dto";
import type { ListMeetingsQuery } from "./dto/list-meetings.query";
import type { UpdateMeetingDto } from "./dto/update-meeting.dto";

@Injectable()
export class MeetingService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateMeetingDto) {
		const { sellerId, storeId } = await this.getMyStore(userId);
		await this.assertUsersExist(dto.userIds);
		await this.assertProductsExist(dto.productIds);
		return this.prisma.meeting.create({
			data: {
				title: dto.title,
				date: new Date(dto.date),
				time: dto.time,
				zoomMeetingId: dto.zoomMeetingId,
				zoomMeetingPassword: dto.zoomMeetingPassword,
				sellerId,
				storeId,
				userIds: dto.userIds ?? [],
				productIds: dto.productIds ?? [],
			},
		});
	}

	async listMine(userId: string, query: ListMeetingsQuery) {
		const { sellerId } = await this.getMyStore(userId);
		return this.runList(query, { sellerId });
	}

	async getMineOne(userId: string, id: string) {
		const { sellerId } = await this.getMyStore(userId);
		return this.assertOwned(id, { sellerId });
	}

	async updateMine(userId: string, id: string, dto: UpdateMeetingDto) {
		const { sellerId } = await this.getMyStore(userId);
		await this.assertOwned(id, { sellerId });
		await this.assertUsersExist(dto.userIds);
		await this.assertProductsExist(dto.productIds);
		const { date, ...rest } = dto;
		return this.prisma.meeting.update({
			where: { id },
			data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
		});
	}

	async deleteMine(userId: string, id: string) {
		const { sellerId } = await this.getMyStore(userId);
		await this.assertOwned(id, { sellerId });
		await this.prisma.meeting.delete({ where: { id } });
		return { deleted: true };
	}

	listInvited(userId: string, query: ListMeetingsQuery) {
		return this.runList(query, { userIds: { has: userId } });
	}

	async getInvitedOne(userId: string, id: string) {
		const meeting = await this.prisma.meeting.findUnique({ where: { id } });
		if (!meeting || !meeting.userIds.includes(userId))
			throw new NotFoundException("Meeting not found");
		return meeting;
	}

	private async runList(
		query: ListMeetingsQuery,
		scope: Prisma.MeetingWhereInput,
	) {
		const { page, limit, status } = query;
		const where: Prisma.MeetingWhereInput = { ...scope };
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.meeting.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { date: "desc" },
			}),
			this.prisma.meeting.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertOwned(id: string, scope: { sellerId: string }) {
		const meeting = await this.prisma.meeting.findUnique({ where: { id } });
		if (!meeting || meeting.sellerId !== scope.sellerId)
			throw new NotFoundException("Meeting not found");
		return meeting;
	}

	private async assertUsersExist(userIds?: string[]) {
		if (!userIds?.length) return;
		const ids = [...new Set(userIds)];
		const count = await this.prisma.user.count({ where: { id: { in: ids } } });
		if (count !== ids.length)
			throw new BadRequestException("One or more invited users do not exist");
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
			select: { id: true },
		});
		if (!store)
			throw new NotFoundException(
				"You do not have a store yet. Create your store first.",
			);
		return { sellerId: profile.id, storeId: store.id };
	}
}
