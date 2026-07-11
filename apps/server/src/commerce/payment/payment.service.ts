import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { GenericStatus, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreatePaymentDto } from "./dto/create-payment.dto";
import type { ListPaymentsQuery } from "./dto/list-payments.query";
import type { UpdatePaymentDto } from "./dto/update-payment.dto";

@Injectable()
export class PaymentService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreatePaymentDto) {
		await this.assertStoreExists(dto.storeId);
		await this.assertSuborderExists(dto.suborderId);
		return this.prisma.payment.create({ data: dto });
	}

	list(query: ListPaymentsQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		const payment = await this.prisma.payment.findUnique({ where: { id } });
		if (!payment) throw new NotFoundException("Payment not found");
		return payment;
	}

	async update(id: string, dto: UpdatePaymentDto) {
		await this.getById(id);
		if (dto.storeId) await this.assertStoreExists(dto.storeId);
		await this.assertSuborderExists(dto.suborderId);
		return this.prisma.payment.update({ where: { id }, data: dto });
	}

	async softDelete(id: string) {
		await this.getById(id);
		await this.prisma.payment.update({
			where: { id },
			data: { status: GenericStatus.inactive },
		});
		return { deleted: true };
	}

	async listMine(userId: string, query: ListPaymentsQuery) {
		const storeId = await this.getMyStoreId(userId);
		return this.runList({ ...query, storeId });
	}

	async getMineOne(userId: string, id: string) {
		const storeId = await this.getMyStoreId(userId);
		const payment = await this.prisma.payment.findUnique({ where: { id } });
		if (!payment || payment.storeId !== storeId)
			throw new NotFoundException("Payment not found");
		return payment;
	}

	private async runList(query: ListPaymentsQuery & { storeId?: string }) {
		const { page, limit, storeId, suborderId, status } = query;
		const where: Prisma.PaymentWhereInput = {};
		if (storeId) where.storeId = storeId;
		if (suborderId) where.suborderId = suborderId;
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.payment.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.payment.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async assertStoreExists(storeId: string) {
		const count = await this.prisma.store.count({ where: { id: storeId } });
		if (!count) throw new BadRequestException("Store does not exist");
	}

	private async assertSuborderExists(suborderId: string | undefined) {
		if (!suborderId) return;
		const count = await this.prisma.subOrder.count({
			where: { id: suborderId },
		});
		if (!count) throw new BadRequestException("Sub-order does not exist");
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
