import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateTicketDto } from "./dto/create-ticket.dto";
import type { ListTicketsQuery } from "./dto/list-tickets.query";
import type { RespondTicketDto } from "./dto/respond-ticket.dto";

@Injectable()
export class TicketService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, sellerName: string, dto: CreateTicketDto) {
		const sellerId = await this.getSellerProfileId(userId);
		const store = await this.prisma.store.findFirst({
			where: { sellerId },
			select: { id: true },
		});
		return this.prisma.ticket.create({
			data: {
				...dto,
				sellerId,
				sellerName,
				storeId: store?.id ?? null,
				status: "open",
			},
		});
	}

	async listMine(userId: string, query: ListTicketsQuery) {
		const sellerId = await this.getSellerProfileId(userId);
		return this.runList({ ...query, sellerId });
	}

	async getMineOne(userId: string, id: string) {
		return this.assertOwned(userId, id);
	}

	async cancelMine(userId: string, id: string) {
		await this.assertOwned(userId, id);
		return this.prisma.ticket.update({
			where: { id },
			data: { status: "cancelled" },
		});
	}

	list(query: ListTicketsQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const ticket = await this.prisma.ticket.findUnique({ where: { id } });
		if (!ticket) throw new NotFoundException("Ticket not found");
		return ticket;
	}

	async respond(id: string, dto: RespondTicketDto) {
		await this.getById(id);
		return this.prisma.ticket.update({ where: { id }, data: dto });
	}

	private async runList(query: ListTicketsQuery) {
		const { page, limit, status, resolved, sellerId, storeId } = query;
		const where: Prisma.TicketWhereInput = {};
		if (status) where.status = status;
		if (resolved !== undefined) where.resolved = resolved;
		if (sellerId) where.sellerId = sellerId;
		if (storeId) where.storeId = storeId;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.ticket.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.ticket.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertOwned(userId: string, id: string) {
		const sellerId = await this.getSellerProfileId(userId);
		const ticket = await this.prisma.ticket.findUnique({ where: { id } });
		if (!ticket || ticket.sellerId !== sellerId)
			throw new NotFoundException("Ticket not found");
		return ticket;
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
