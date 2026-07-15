import { PrismaClient } from "@repo/db";
import { seedCatalog } from "./catalog.seed";
import { seedCommerce } from "./commerce.seed";
import { seedEngagement } from "./engagement.seed";
import { seedLive } from "./live.seed";
import { seedOps } from "./ops.seed";
import { seedReels } from "./reels.seed";
import { seedTryon } from "./tryon.seed";
import { seedUsers } from "./users.seed";

const prisma = new PrismaClient();

// Empty every collection via raw Mongo commands. deleteMany() is not usable
// here because Prisma enforces the Category self-relation (CategoryHierarchy)
// and refuses to bulk-delete rows that reference each other. Raw deletes bypass
// that guard and preserve collection indexes.
async function wipe() {
	const result = (await prisma.$runCommandRaw({
		listCollections: 1,
		nameOnly: true,
	})) as unknown as { cursor: { firstBatch: { name: string }[] } };

	for (const { name } of result.cursor.firstBatch) {
		if (name.startsWith("system.")) continue;
		await prisma.$runCommandRaw({
			delete: name,
			deletes: [{ q: {}, limit: 0 }],
		});
	}
}

async function main() {
	console.log("Wiping database…");
	await wipe();

	console.log("Seeding users…");
	const users = await seedUsers(prisma);
	console.log("Seeding catalog…");
	const catalog = await seedCatalog(prisma, users);
	console.log("Seeding commerce…");
	const commerce = await seedCommerce(prisma, users, catalog);
	console.log("Seeding engagement…");
	const engagement = await seedEngagement(prisma, users, catalog);
	console.log("Seeding reels…");
	const reels = await seedReels(prisma, users, catalog);
	console.log("Seeding live…");
	const live = await seedLive(prisma, users, catalog);
	console.log("Seeding ops…");
	const ops = await seedOps(prisma, users, catalog);
	console.log("Seeding try-on…");
	const tryon = await seedTryon(prisma, users, catalog);

	console.log("\n─────────────── Seed summary ───────────────");
	const counts: [string, number][] = [
		["admins", 1],
		["sellers", users.sellers.length],
		["customers", users.customers.length],
		["categories", catalog.categories.length],
		["brands", catalog.brands.length],
		["stores", catalog.stores.length],
		["products", catalog.products.length],
		["variants", catalog.variants.length],
		["orders", commerce.orders],
		["coupons", commerce.coupons],
		["reviews", engagement.reviews],
		["store reviews", engagement.storeReviews],
		["reels", reels],
		["meet requests", live.meetRequests],
		["meetings", live.meetings],
		["live demos", live.liveDemos],
		["tickets", ops.tickets],
		["courier partners", ops.couriers],
		["try-on sessions", tryon],
	];
	for (const [label, n] of counts) {
		console.log(`  ${String(n).padStart(4)}  ${label}`);
	}

	console.log("\nLogin accounts (password in parentheses):");
	console.log("  admin     admin@trialshopy.com     (Admin@12345)");
	console.log("  seller    seller@trialshopy.com    (Seller@12345)");
	console.log("  customer  customer@trialshopy.com  (Customer@12345)");
	console.log("  + seller2..5@trialshopy.com (Seller@12345)");
	console.log("  + customer2..8@trialshopy.com (Customer@12345)");
	console.log("─────────────────────────────────────────────");
}

main()
	.then(() => console.log("\nSeed complete."))
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
		process.exit(process.exitCode ?? 0);
	});
