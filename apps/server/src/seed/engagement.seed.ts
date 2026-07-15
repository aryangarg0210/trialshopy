import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import { int, media, pick, round2, sample } from "./helpers";
import type { SeededUsers } from "./users.seed";

export interface SeededEngagement {
	reviews: number;
	storeReviews: number;
}

const REVIEW_TEXTS = [
	"Great quality, exactly as described.",
	"Good value for money, would buy again.",
	"Decent product but delivery was slow.",
	"Absolutely love it, highly recommend!",
	"Fit is perfect and material feels premium.",
	"Average experience, expected a bit more.",
];

export async function seedEngagement(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<SeededEngagement> {
	const customerIds = users.customers.map((c) => c.id);
	const activeProducts = catalog.products.filter((p) => p.status === "active");

	// Reviews — spread across products, unique per (user, product).
	let reviewCount = 0;
	for (const product of activeProducts) {
		const reviewers = sample(customerIds, int(1, 4));
		const ratings: number[] = [];
		for (const userId of reviewers) {
			const rating = int(3, 5);
			ratings.push(rating);
			await prisma.review.create({
				data: {
					userId,
					productId: product.id,
					reviewText: pick(REVIEW_TEXTS),
					rating,
					pictures: int(0, 1) ? [media(`review-${reviewCount}`)] : [],
					likeIds: sample(customerIds, int(0, 3)),
					dislikeIds: [],
					status: "active",
				},
			});
			reviewCount++;
		}
		const avg = round2(ratings.reduce((a, b) => a + b, 0) / ratings.length);
		await prisma.product.update({
			where: { id: product.id },
			data: { rating: { set: { count: ratings.length, average: avg } } },
		});
	}

	// Store reviews — recompute Store.rating + reviewCount.
	let storeReviewCount = 0;
	for (const store of catalog.stores) {
		const reviewers = sample(customerIds, int(1, 3));
		const ratings: number[] = [];
		for (const userId of reviewers) {
			const rating = int(3, 5);
			ratings.push(rating);
			await prisma.storeReview.create({
				data: {
					userId,
					storeId: store.id,
					reviewText: pick(REVIEW_TEXTS),
					rating,
					status: "active",
				},
			});
			storeReviewCount++;
		}
		const avg = round2(ratings.reduce((a, b) => a + b, 0) / ratings.length);
		await prisma.store.update({
			where: { id: store.id },
			data: {
				rating: { set: { count: ratings.length, average: avg } },
				reviewCount: ratings.length,
			},
		});
	}

	// Notifications — a few per customer.
	for (const customer of users.customers) {
		for (const message of [
			"Welcome to TrialShopy!",
			"Your order has been placed.",
			"A product in your wishlist is on sale.",
		]) {
			await prisma.notification.create({
				data: {
					userId: customer.id,
					message,
					status: pick(["read", "unread"]),
				},
			});
		}
	}

	// FAQs.
	for (const [question, answer] of [
		[
			"How do I track my order?",
			"Go to My Orders and select the order to see its status.",
		],
		[
			"What is the return policy?",
			"Items can be returned within 7 days of delivery.",
		],
		[
			"How do I become a seller?",
			"Register as a seller from your profile and complete KYC.",
		],
		[
			"Do you offer student discounts?",
			"Yes, verify your student email to unlock student coupons.",
		],
		[
			"How are refunds processed?",
			"Refunds are credited to the original payment method within 5-7 days.",
		],
		[
			"Is cash on delivery available?",
			"COD is available on eligible orders and pincodes.",
		],
	] as const) {
		await prisma.faq.create({ data: { question, answer } });
	}

	// Contact-us submissions.
	for (let i = 0; i < 3; i++) {
		await prisma.contactUs.create({
			data: {
				firstName: "Guest",
				lastName: `User${i + 1}`,
				email: `guest${i + 1}@example.com`,
				phone: `+9198765432${10 + i}`,
				message: "I have a question about my recent order.",
				attachments: [],
			},
		});
	}

	// Headers — merchandising rows tied to a subcategory.
	for (const child of catalog.childCategories.slice(0, 3)) {
		const productIds = activeProducts
			.filter((p) => p.categoryId === child.id)
			.slice(0, 4)
			.map((p) => p.id);
		await prisma.header.create({
			data: {
				title: `Top picks in ${child.name}`,
				productIds,
				subcategoryId: child.id,
			},
		});
	}

	// Sponsored products.
	for (const child of catalog.childCategories.slice(0, 3)) {
		const product = activeProducts.find((p) => p.categoryId === child.id);
		if (!product) continue;
		await prisma.sponsoredProduct.create({
			data: {
				productId: product.id,
				categoryId: child.parentId ?? child.id,
				subcategoryId: child.id,
			},
		});
	}

	// Banners — one per root category (category is unique).
	for (const root of catalog.rootCategories) {
		await prisma.banner.create({
			data: { url: media(`banner-${root.name}`).url, category: root.name },
		});
	}

	return { reviews: reviewCount, storeReviews: storeReviewCount };
}
