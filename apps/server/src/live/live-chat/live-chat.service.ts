import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateLiveChatDto } from "./dto/create-live-chat.dto";
import type { ListMessagesQuery } from "./dto/list-messages.query";
import type { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class LiveChatService {
	constructor(private readonly prisma: PrismaService) {}

	async getOrCreate(userId: string, dto: CreateLiveChatDto) {
		if (dto.receiverId === userId)
			throw new BadRequestException("You cannot start a chat with yourself");
		const receiver = await this.prisma.user.count({
			where: { id: dto.receiverId },
		});
		if (!receiver) throw new NotFoundException("User not found");

		const existing = await this.prisma.liveChat.findFirst({
			where: {
				OR: [
					{ senderId: userId, receiverId: dto.receiverId },
					{ senderId: dto.receiverId, receiverId: userId },
				],
			},
		});
		if (existing) return existing;

		return this.prisma.liveChat.create({
			data: { senderId: userId, receiverId: dto.receiverId },
		});
	}

	async listMine(userId: string) {
		const chats = await this.prisma.liveChat.findMany({
			where: { OR: [{ senderId: userId }, { receiverId: userId }] },
			orderBy: { updatedAt: "desc" },
		});
		return this.attachParticipants(userId, chats);
	}

	async listMessages(userId: string, chatId: string, query: ListMessagesQuery) {
		await this.assertParticipant(userId, chatId);
		const { page, limit } = query;
		const where = { liveChatId: chatId };
		const [data, total] = await this.prisma.$transaction([
			this.prisma.liveMessage.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.liveMessage.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async sendMessage(userId: string, chatId: string, dto: SendMessageDto) {
		await this.assertParticipant(userId, chatId);
		if (!dto.text && !dto.imageUrl && !dto.videoUrl)
			throw new BadRequestException(
				"A message must include text, an image, or a video",
			);

		const message = await this.prisma.liveMessage.create({
			data: {
				liveChatId: chatId,
				msgByUserId: userId,
				text: dto.text ?? "",
				imageUrl: dto.imageUrl ?? "",
				videoUrl: dto.videoUrl ?? "",
			},
		});
		await this.prisma.liveChat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() },
		});
		return message;
	}

	async markSeen(userId: string, chatId: string) {
		await this.assertParticipant(userId, chatId);
		const { count } = await this.prisma.liveMessage.updateMany({
			where: { liveChatId: chatId, msgByUserId: { not: userId }, seen: false },
			data: { seen: true },
		});
		return { seen: count };
	}

	private async assertParticipant(userId: string, chatId: string) {
		const chat = await this.prisma.liveChat.findUnique({
			where: { id: chatId },
			select: { id: true, senderId: true, receiverId: true },
		});
		if (!chat || (chat.senderId !== userId && chat.receiverId !== userId))
			throw new NotFoundException("Chat not found");
		return chat;
	}

	private async attachParticipants<
		T extends { senderId: string; receiverId: string },
	>(userId: string, chats: T[]) {
		if (!chats.length) return [];
		const otherIds = [
			...new Set(
				chats.map((c) => (c.senderId === userId ? c.receiverId : c.senderId)),
			),
		];
		const users = await this.prisma.user.findMany({
			where: { id: { in: otherIds } },
			select: { id: true, name: true, image: true },
		});
		const userMap = new Map(users.map((u) => [u.id, u]));
		return chats.map((chat) => ({
			...chat,
			otherUser:
				userMap.get(
					chat.senderId === userId ? chat.receiverId : chat.senderId,
				) ?? null,
		}));
	}
}
