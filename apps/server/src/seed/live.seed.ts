import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import { daysAgo, daysFromNow, int, pick, sample } from "./helpers";
import type { SeededUsers } from "./users.seed";

export async function seedLive(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<{ meetRequests: number; meetings: number; liveDemos: number }> {
	const sellerUserByProfile = new Map(
		users.sellerProfiles.map((p) => [p.id, p.userId]),
	);
	const activeStores = catalog.stores.filter((s) => s.status === "active");

	// Meet requests (customer -> store).
	let meetRequests = 0;
	for (let i = 0; i < 6; i++) {
		const store = activeStores[i % activeStores.length];
		const customer = users.customers[i % users.customers.length];
		const storeProducts = catalog.products
			.filter((p) => p.storeId === store.id)
			.slice(0, 2)
			.map((p) => p.id);
		await prisma.meetRequest.create({
			data: {
				purpose: "Product demo and sizing help",
				userId: customer.id,
				storeId: store.id,
				productIds: storeProducts,
				date: daysFromNow(i + 1),
				time: "15:30",
				status: pick(["pending", "confirmed"]),
			},
		});
		meetRequests++;
	}

	// Meetings (seller-hosted, invited customers).
	let meetings = 0;
	for (let i = 0; i < 4; i++) {
		const store = activeStores[i % activeStores.length];
		const invited = sample(
			users.customers.map((c) => c.id),
			int(1, 3),
		);
		const storeProducts = catalog.products
			.filter((p) => p.storeId === store.id)
			.slice(0, 3)
			.map((p) => p.id);
		await prisma.meeting.create({
			data: {
				title: `Live shopping session ${i + 1}`,
				status: pick(["scheduled", "completed"]),
				date: daysFromNow(i + 2),
				time: "18:00",
				zoomMeetingId: `zoom-${900000 + i}`,
				zoomMeetingPassword: `pwd${1000 + i}`,
				sellerId: store.sellerId,
				storeId: store.id,
				userIds: invited,
				productIds: storeProducts,
			},
		});
		meetings++;
	}

	// Live demos (customer sessions; some active, some ended).
	let liveDemos = 0;
	for (let i = 0; i < 5; i++) {
		const customer = users.customers[i % users.customers.length];
		const store = activeStores[i % activeStores.length];
		const items = sample(
			catalog.products.filter((p) => p.storeId === store.id).map((p) => p.id),
			int(1, 2),
		);
		const ended = i % 2 === 0;
		await prisma.liveDemo.create({
			data: {
				customerId: customer.id,
				storeId: store.id,
				itemIds: items,
				startTime: daysAgo(1),
				endTime: ended ? daysAgo(0) : null,
			},
		});
		liveDemos++;
	}

	// Live chats + messages (customer <-> seller user).
	for (let i = 0; i < 3; i++) {
		const customer = users.customers[i];
		const sellerUserId = sellerUserByProfile.get(activeStores[i].sellerId)!;
		const chat = await prisma.liveChat.create({
			data: { senderId: customer.id, receiverId: sellerUserId },
		});
		await prisma.liveMessage.create({
			data: {
				liveChatId: chat.id,
				msgByUserId: customer.id,
				text: "Hi, is this product available in size L?",
			},
		});
		await prisma.liveMessage.create({
			data: {
				liveChatId: chat.id,
				msgByUserId: sellerUserId,
				text: "Yes! It is in stock. Would you like to see it live?",
				seen: true,
			},
		});
	}

	// Generic support chats.
	for (let i = 0; i < 2; i++) {
		await prisma.chat.create({
			data: {
				messages: [
					{
						sender: "customer",
						subject: "Order help",
						content: "My order is delayed.",
					},
					{ sender: "support", content: "We are looking into it, apologies!" },
				],
			},
		});
	}

	return { meetRequests, meetings, liveDemos };
}
