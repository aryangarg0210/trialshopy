import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	AddressOwnerType,
	CatalogStatus,
	FulfilmentStage,
	GenericStatus,
	OrderStatus,
	type Prisma,
	SubOrderStatus,
} from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { ListOrdersQuery } from "./dto/list-orders.query";
import type { PlaceOrderDto } from "./dto/place-order.dto";

const CANCELLABLE: OrderStatus[] = [
	OrderStatus.pending,
	OrderStatus.processing,
];

@Injectable()
export class OrderService {
	constructor(private readonly prisma: PrismaService) {}

	async place(userId: string, dto: PlaceOrderDto) {
		await this.assertCustomer(userId);

		const cart = await this.prisma.cart.findUnique({
			where: { customerId: userId },
		});
		if (!cart || cart.items.length === 0)
			throw new BadRequestException("Your cart is empty");

		const addressId = dto.addressId ?? cart.addressId;
		if (!addressId)
			throw new BadRequestException("A delivery address is required");
		const address = await this.resolveOwnedAddress(userId, addressId);

		return this.prisma.$transaction(async (tx) => {
			let totalPrice = 0;
			const lines: Prisma.SubOrderCreateWithoutOrderInput[] = [];

			for (const item of cart.items) {
				const priced = await this.priceLine(tx, item);
				totalPrice += priced.finalPrice;

				if (item.variantId)
					await tx.productVariant.update({
						where: { id: item.variantId },
						data: { stock: { decrement: item.quantity } },
					});
				else
					await tx.product.update({
						where: { id: item.productId },
						data: { stock: { decrement: item.quantity } },
					});

				lines.push({
					productId: item.productId,
					variantId: item.variantId ?? undefined,
					storeId: priced.storeId ?? undefined,
					sellerId: priced.sellerId ?? undefined,
					customerId: userId,
					size: item.size ?? undefined,
					quantity: item.quantity,
					mrp: priced.mrp ?? undefined,
					finalPrice: priced.finalPrice,
					status: SubOrderStatus.pending,
					statusUpdates: [
						{ stage: FulfilmentStage.placed, timestamp: new Date() },
					],
				});
			}

			const order = await tx.order.create({
				data: {
					customerId: userId,
					totalPrice: round(totalPrice),
					phoneNumber: dto.phoneNumber ?? address.phoneNumber ?? undefined,
					shippingAddress: {
						fullName: address.fullName ?? undefined,
						phoneNumber: address.phoneNumber ?? undefined,
						alternatePhone: address.alternatePhone ?? undefined,
						addressLine: address.addressLine ?? undefined,
						city: address.city,
						pincode: address.pincode,
						landmark: address.landmark ?? undefined,
						state: address.state,
						country: address.country,
					},
					status: OrderStatus.pending,
					subOrders: { create: lines },
				},
				include: { subOrders: true },
			});

			await tx.cart.update({
				where: { id: cart.id },
				data: { items: { set: [] }, addressId: null },
			});

			return order;
		});
	}

	async listMine(userId: string, query: ListOrdersQuery) {
		return this.runList({ ...query, customerId: userId });
	}

	async getMineOne(userId: string, id: string) {
		const order = await this.findDetail(id);
		if (order.customerId !== userId)
			throw new NotFoundException("Order not found");
		return order;
	}

	async cancelMine(userId: string, id: string) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { subOrders: true },
		});
		if (!order || order.customerId !== userId)
			throw new NotFoundException("Order not found");
		return this.cancel(order);
	}

	async list(query: ListOrdersQuery) {
		return this.runList(query);
	}

	async getById(id: string) {
		return this.findDetail(id);
	}

	async setStatus(id: string, status: OrderStatus) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { subOrders: true },
		});
		if (!order) throw new NotFoundException("Order not found");

		if (status === OrderStatus.cancelled) return this.cancel(order);

		return this.prisma.order.update({
			where: { id },
			data: { status },
			include: { subOrders: true },
		});
	}

	private async cancel(order: {
		id: string;
		status: OrderStatus;
		subOrders: {
			productId: string;
			variantId: string | null;
			quantity: number;
		}[];
	}) {
		if (!CANCELLABLE.includes(order.status))
			throw new BadRequestException(
				`An order that is ${order.status} cannot be cancelled`,
			);

		return this.prisma.$transaction(async (tx) => {
			for (const line of order.subOrders) {
				if (line.variantId)
					await tx.productVariant.update({
						where: { id: line.variantId },
						data: { stock: { increment: line.quantity } },
					});
				else
					await tx.product.update({
						where: { id: line.productId },
						data: { stock: { increment: line.quantity } },
					});
			}

			await tx.subOrder.updateMany({
				where: { orderId: order.id },
				data: { status: SubOrderStatus.cancelled },
			});

			return tx.order.update({
				where: { id: order.id },
				data: { status: OrderStatus.cancelled },
				include: { subOrders: true },
			});
		});
	}

	private async priceLine(
		tx: Prisma.TransactionClient,
		item: { productId: string; variantId: string | null; quantity: number },
	) {
		const product = await tx.product.findUnique({
			where: { id: item.productId },
			select: {
				status: true,
				stock: true,
				basePrice: true,
				discount: true,
				mrp: true,
				storeId: true,
				sellerId: true,
			},
		});
		if (!product)
			throw new BadRequestException("A product in your cart no longer exists");
		if (product.status !== CatalogStatus.active)
			throw new BadRequestException("A product in your cart is unavailable");

		let unitPrice = product.basePrice;
		let discount = product.discount;
		let mrp = product.mrp;
		let available = product.stock;

		if (item.variantId) {
			const variant = await tx.productVariant.findUnique({
				where: { id: item.variantId },
				select: {
					productId: true,
					status: true,
					stock: true,
					price: true,
					discount: true,
					mrp: true,
				},
			});
			if (!variant || variant.productId !== item.productId)
				throw new BadRequestException("A variant in your cart is invalid");
			if (variant.status !== CatalogStatus.active)
				throw new BadRequestException("A variant in your cart is unavailable");
			unitPrice = variant.price;
			discount = variant.discount;
			mrp = variant.mrp;
			available = variant.stock;
		}

		if (available < item.quantity)
			throw new BadRequestException(
				`Insufficient stock: only ${available} left of an item in your cart`,
			);

		const unitFinal = unitPrice * (1 - discount / 100);
		return {
			finalPrice: round(unitFinal * item.quantity),
			mrp,
			storeId: product.storeId,
			sellerId: product.sellerId,
		};
	}

	private async runList(query: ListOrdersQuery & { customerId?: string }) {
		const { page, limit, status, customerId } = query;
		const where: Prisma.OrderWhereInput = {};
		if (status) where.status = status;
		if (customerId) where.customerId = customerId;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.order.findMany({
				where,
				include: { subOrders: true },
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.order.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	private async findDetail(id: string) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { subOrders: true },
		});
		if (!order) throw new NotFoundException("Order not found");
		return order;
	}

	private async assertCustomer(userId: string) {
		const profile = await this.prisma.customerProfile.findUnique({
			where: { userId },
			select: { id: true },
		});
		if (!profile)
			throw new ForbiddenException(
				"Complete your customer profile before placing an order",
			);
	}

	private async resolveOwnedAddress(userId: string, addressId: string) {
		const address = await this.prisma.address.findUnique({
			where: { id: addressId },
		});
		if (
			!address ||
			address.ownerType !== AddressOwnerType.user ||
			address.ownerId !== userId ||
			address.status !== GenericStatus.active
		)
			throw new NotFoundException("Address not found");
		return address;
	}
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}
