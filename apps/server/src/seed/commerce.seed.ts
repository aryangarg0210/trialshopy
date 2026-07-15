import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import {
	daysAgo,
	daysFromNow,
	geo,
	int,
	media,
	pick,
	round2,
	sample,
} from "./helpers";
import type { SeededUsers } from "./users.seed";

export interface SeededCommerce {
	orders: number;
	coupons: number;
}

const ORDER_STATUSES = [
	"pending",
	"processing",
	"shipped",
	"delivered",
	"delivered",
	"cancelled",
] as const;

export async function seedCommerce(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<SeededCommerce> {
	const activeProducts = catalog.products.filter((p) => p.status === "active");

	// Addresses — 1-2 per customer, first is default.
	const addressByCustomer = new Map<string, string>();
	for (const [i, customer] of users.customers.entries()) {
		const count = int(1, 2);
		for (let a = 0; a < count; a++) {
			const addr = await prisma.address.create({
				data: {
					ownerId: customer.id,
					ownerType: "user",
					type: a === 0 ? "home" : "work",
					fullName: customer.name,
					phoneNumber: `+9191111111${10 + i}`,
					addressLine: `${a + 1}, Green Avenue`,
					city: "Mumbai",
					pincode: "400001",
					state: "Maharashtra",
					country: "India",
					location: geo(72.87, 19.07),
					isDefault: a === 0,
				},
			});
			if (a === 0) addressByCustomer.set(customer.id, addr.id);
		}
	}

	// Wishlists — a few products per customer profile.
	for (const profile of users.customerProfiles) {
		await prisma.customerProfile.update({
			where: { id: profile.id },
			data: { wishlistIds: sample(activeProducts, int(2, 4)).map((p) => p.id) },
		});
	}

	// Carts — half the customers have populated carts.
	for (let i = 0; i < users.customers.length; i += 2) {
		const customer = users.customers[i];
		const chosen = sample(activeProducts, int(1, 3));
		await prisma.cart.create({
			data: {
				customerId: customer.id,
				addressId: addressByCustomer.get(customer.id) ?? null,
				items: chosen.map((p) => {
					const variant = catalog.variants.find((v) => v.productId === p.id);
					return {
						productId: p.id,
						variantId: variant?.id ?? null,
						quantity: int(1, 3),
						size: variant?.size ?? null,
					};
				}),
			},
		});
	}

	// Orders — ~12 with per-store suborders and computed totals.
	let orderCount = 0;
	for (let o = 0; o < 12; o++) {
		const customer = users.customers[o % users.customers.length];
		const status = ORDER_STATUSES[o % ORDER_STATUSES.length];
		const lines = sample(activeProducts, int(1, 3));
		let total = 0;
		const order = await prisma.order.create({
			data: {
				customerId: customer.id,
				totalPrice: 0,
				phoneNumber: `+9191111111${10 + (o % users.customers.length)}`,
				shippingAddress: {
					fullName: customer.name,
					phoneNumber: `+9191111111${10 + (o % users.customers.length)}`,
					addressLine: "1, Green Avenue",
					city: "Mumbai",
					pincode: "400001",
					state: "Maharashtra",
					country: "India",
				},
				status,
				payment: [
					{
						transactionId: `TXN-${20000 + o}`,
						totalAmount: 0,
						paymentDate: daysAgo(o),
						status: status === "cancelled" ? "failed" : "success",
					},
				],
			},
		});

		for (const p of lines) {
			const variant = catalog.variants.find((v) => v.productId === p.id);
			const qty = int(1, 2);
			const unit = variant?.price ?? p.basePrice;
			const final = round2(unit * (1 - (p.discount ?? 0) / 100));
			total += final * qty;
			await prisma.subOrder.create({
				data: {
					orderId: order.id,
					productId: p.id,
					variantId: variant?.id ?? null,
					storeId: p.storeId,
					sellerId: p.sellerId,
					customerId: customer.id,
					skuId: variant?.sku ?? null,
					size: variant?.size ?? null,
					quantity: qty,
					mrp: p.mrp ?? unit,
					finalPrice: final,
					status,
					deliveryStatus:
						status === "delivered"
							? "delivered"
							: status === "shipped"
								? "in_transit"
								: null,
					statusUpdates: [{ stage: "placed", timestamp: daysAgo(o + 2) }],
					deliveryPartner: "Delhivery",
					deliveryPrice: 49,
					totalAfterDelivery: round2(final * qty + 49),
				},
			});
		}

		await prisma.order.update({
			where: { id: order.id },
			data: {
				totalPrice: round2(total),
				payment: {
					set: [
						{
							transactionId: `TXN-${20000 + o}`,
							totalAmount: round2(total),
							paymentDate: daysAgo(o),
							status: status === "cancelled" ? "failed" : "success",
						},
					],
				},
			},
		});
		orderCount++;
	}

	// Payments — store payout ledger entries.
	for (const store of catalog.stores) {
		await prisma.payment.create({
			data: {
				storeId: store.id,
				totalItems: int(5, 40),
				totalRevenue: round2(int(10000, 90000)),
				finalPrice: round2(int(9000, 85000)),
				balance: round2(int(0, 5000)),
				sgst: round2(int(500, 3000)),
				cgst: round2(int(500, 3000)),
				status: "active",
			},
		});
	}

	// Coupons.
	const coupons = [
		{ code: "WELCOME10", discount: 10, min: 500 },
		{ code: "SAVE20", discount: 20, min: 1500 },
		{ code: "FEST25", discount: 25, min: 3000 },
		{ code: "FLAT15", discount: 15, min: 1000 },
	];
	for (const c of coupons) {
		await prisma.coupon.create({
			data: {
				code: c.code,
				data: `${c.discount}% off`,
				discount: c.discount,
				validFrom: daysAgo(5),
				validTo: daysFromNow(30),
				minimumPurchaseAmount: c.min,
				status: "active",
			},
		});
	}

	// Coupon domains (email-domain discounts).
	for (const [couponType, domain, discount] of [
		["college", "mit.edu", 15],
		["college", "iitb.ac.in", 12],
		["itsector", "infosys.com", 8],
	] as const) {
		await prisma.couponDomain.create({
			data: { couponType, domain, discount, status: "active" },
		});
	}

	// Student verifications — one approved, one pending.
	for (const [i, customer] of users.customers.slice(0, 2).entries()) {
		await prisma.studentVerification.create({
			data: {
				userId: customer.id,
				couponType: "college",
				document: media(`student-${i}`),
				status: i === 0 ? "active" : "inactive",
			},
		});
	}

	// Offers — store offers + a brand offer.
	for (const [i, store] of catalog.stores.slice(0, 3).entries()) {
		const storeProducts = catalog.products
			.filter((p) => p.storeId === store.id)
			.slice(0, 3)
			.map((p) => p.id);
		await prisma.offer.create({
			data: {
				storeId: store.id,
				title: `Store Sale ${i + 1}`,
				description: "Limited time store-wide discount",
				discount: pick([10, 15, 20]),
				applicableProductIds: storeProducts,
				validFrom: daysAgo(2),
				validUntil: daysFromNow(14),
			},
		});
	}
	await prisma.offer.create({
		data: {
			brandId: catalog.brands[0].id,
			title: "Brand Launch Offer",
			description: "Introductory brand discount",
			discount: 18,
			validFrom: daysAgo(1),
			validUntil: daysFromNow(20),
		},
	});

	// Commissions per product (subset).
	for (const p of sample(catalog.products, 8)) {
		await prisma.commission.create({
			data: {
				productId: p.id,
				commission: pick([5, 8, 10, 12]),
				datedFrom: daysAgo(10),
				datedTo: daysFromNow(60),
				status: "active",
			},
		});
	}

	return { orders: orderCount, coupons: coupons.length };
}
