import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { AddressOwnerType, CatalogStatus, GenericStatus } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { AddCartItemDto } from "./dto/add-cart-item.dto";
import type { RemoveCartItemDto } from "./dto/remove-cart-item.dto";

type CartLine = {
	productId: string;
	variantId: string | null;
	quantity: number;
	size: string | null;
};

type LineKey = { productId: string; variantId?: string; size?: string };

@Injectable()
export class CartService {
	constructor(private readonly prisma: PrismaService) {}

	async getMine(userId: string) {
		return this.getOrCreate(userId);
	}

	async addItem(userId: string, dto: AddCartItemDto) {
		const cart = await this.getOrCreate(userId);
		const items = [...cart.items];
		const idx = items.findIndex((item) => this.sameLine(item, dto));
		const nextQuantity = (idx >= 0 ? items[idx].quantity : 0) + dto.quantity;

		const available = await this.resolveAvailableStock(
			dto.productId,
			dto.variantId,
		);
		this.assertWithinStock(nextQuantity, available);

		if (idx >= 0) items[idx] = { ...items[idx], quantity: nextQuantity };
		else items.push(this.toLine(dto, dto.quantity));

		return this.writeItems(cart.id, items);
	}

	async setItemQuantity(userId: string, dto: AddCartItemDto) {
		const cart = await this.getOrCreate(userId);
		const items = [...cart.items];
		const idx = items.findIndex((item) => this.sameLine(item, dto));
		if (idx < 0) throw new NotFoundException("Item not in cart");

		const available = await this.resolveAvailableStock(
			dto.productId,
			dto.variantId,
		);
		this.assertWithinStock(dto.quantity, available);

		items[idx] = { ...items[idx], quantity: dto.quantity };
		return this.writeItems(cart.id, items);
	}

	async removeItem(userId: string, dto: RemoveCartItemDto) {
		const cart = await this.getOrCreate(userId);
		const items = cart.items.filter((item) => !this.sameLine(item, dto));
		if (items.length === cart.items.length)
			throw new NotFoundException("Item not in cart");
		return this.writeItems(cart.id, items);
	}

	async clear(userId: string) {
		const cart = await this.getOrCreate(userId);
		return this.writeItems(cart.id, []);
	}

	async setAddress(userId: string, addressId: string) {
		await this.assertAddressOwned(userId, addressId);
		const cart = await this.getOrCreate(userId);
		return this.prisma.cart.update({
			where: { id: cart.id },
			data: { addressId },
		});
	}

	private async getOrCreate(userId: string) {
		const existing = await this.prisma.cart.findUnique({
			where: { customerId: userId },
		});
		return (
			existing ?? this.prisma.cart.create({ data: { customerId: userId } })
		);
	}

	private writeItems(cartId: string, items: CartLine[]) {
		return this.prisma.cart.update({
			where: { id: cartId },
			data: { items: { set: items } },
		});
	}

	private sameLine(line: CartLine, key: LineKey) {
		return (
			line.productId === key.productId &&
			(line.variantId ?? null) === (key.variantId ?? null) &&
			(line.size ?? null) === (key.size ?? null)
		);
	}

	private toLine(key: LineKey, quantity: number): CartLine {
		return {
			productId: key.productId,
			variantId: key.variantId ?? null,
			quantity,
			size: key.size ?? null,
		};
	}

	private assertWithinStock(quantity: number, available: number) {
		if (quantity > available)
			throw new BadRequestException(
				available > 0 ? `Only ${available} in stock` : "Out of stock",
			);
	}

	private async resolveAvailableStock(productId: string, variantId?: string) {
		const product = await this.prisma.product.findUnique({
			where: { id: productId },
			select: { status: true, stock: true },
		});
		if (!product) throw new NotFoundException("Product not found");
		if (product.status !== CatalogStatus.active)
			throw new BadRequestException("Product is not available");

		if (!variantId) return product.stock;

		const variant = await this.prisma.productVariant.findUnique({
			where: { id: variantId },
			select: { productId: true, status: true, stock: true },
		});
		if (!variant || variant.productId !== productId)
			throw new BadRequestException("Variant does not belong to this product");
		if (variant.status !== CatalogStatus.active)
			throw new BadRequestException("Variant is not available");
		return variant.stock;
	}

	private async assertAddressOwned(userId: string, addressId: string) {
		const address = await this.prisma.address.findUnique({
			where: { id: addressId },
			select: { ownerId: true, ownerType: true, status: true },
		});
		if (
			!address ||
			address.ownerType !== AddressOwnerType.user ||
			address.ownerId !== userId ||
			address.status !== GenericStatus.active
		)
			throw new NotFoundException("Address not found");
	}
}
