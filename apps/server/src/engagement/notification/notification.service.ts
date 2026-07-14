import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { NotificationStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateNotificationDto } from "./dto/create-notification.dto";
import type { ListNotificationsQuery } from "./dto/list-notifications.query";

@Injectable()
export class NotificationService {
	constructor(private readonly prisma: PrismaService) {}

	listMine(userId: string, query: ListNotificationsQuery) {
		return this.runList({ ...query, userId });
	}

	async markRead(userId: string, id: string) {
		await this.assertOwned(userId, id);
		return this.prisma.notification.update({
			where: { id },
			data: { status: NotificationStatus.read },
		});
	}

	async markAllRead(userId: string) {
		const { count } = await this.prisma.notification.updateMany({
			where: { userId, status: NotificationStatus.unread },
			data: { status: NotificationStatus.read },
		});
		return { updated: count };
	}

	async deleteMine(userId: string, id: string) {
		await this.assertOwned(userId, id);
		await this.prisma.notification.delete({ where: { id } });
		return { deleted: true };
	}

	async adminCreate(dto: CreateNotificationDto) {
		const user = await this.prisma.user.count({ where: { id: dto.userId } });
		if (!user) throw new BadRequestException("User does not exist");
		return this.prisma.notification.create({
			data: {
				userId: dto.userId,
				message: dto.message,
				...(dto.sendAt ? { sendAt: new Date(dto.sendAt) } : {}),
			},
		});
	}

	adminList(query: ListNotificationsQuery) {
		return this.runList(query);
	}

	private async runList(query: ListNotificationsQuery) {
		const { page, limit, status, userId } = query;
		const where: Prisma.NotificationWhereInput = {};
		if (userId) where.userId = userId;
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.notification.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { sendAt: "desc" },
			}),
			this.prisma.notification.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertOwned(userId: string, id: string) {
		const notification = await this.prisma.notification.findUnique({
			where: { id },
			select: { userId: true },
		});
		if (!notification || notification.userId !== userId)
			throw new NotFoundException("Notification not found");
	}
}
