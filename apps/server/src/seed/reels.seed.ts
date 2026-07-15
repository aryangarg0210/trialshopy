import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import { int, pick, sample, videoUrl } from "./helpers";
import type { SeededUsers } from "./users.seed";

const CAPTIONS = [
	"Unboxing our latest drop 🔥",
	"Styling this three different ways",
	"Behind the scenes at the store",
	"Customer favourite of the week",
	"Quick review — worth it?",
];

export async function seedReels(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<number> {
	const customerIds = users.customers.map((c) => c.id);
	const sellerUserByProfile = new Map(
		users.sellerProfiles.map((p) => [p.id, p.userId]),
	);

	let count = 0;
	for (let i = 0; i < 10; i++) {
		const isStore = i % 2 === 0;
		const store = isStore ? catalog.stores[i % catalog.stores.length] : null;
		const authorId = isStore
			? sellerUserByProfile.get(store!.sellerId)!
			: pick(customerIds);

		await prisma.reel.create({
			data: {
				authorType: isStore ? "store" : "customer",
				authorId,
				storeId: store?.id ?? null,
				video: videoUrl(`reel-${i}`),
				caption: pick(CAPTIONS),
				type: isStore ? "store" : "customer",
				likeIds: sample(customerIds, int(0, 5)),
				dislikeIds: sample(customerIds, int(0, 2)),
				comments: sample(customerIds, int(0, 3)).map((userId) => ({
					userId,
					comment: pick(["Love this!", "Where can I buy?", "Nice 👌"]),
				})),
				shares: int(0, 20),
			},
		});
		count++;
	}
	return count;
}
