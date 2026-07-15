import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import { imageUrl, pick, sample } from "./helpers";
import type { SeededUsers } from "./users.seed";

export async function seedTryon(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<number> {
	const products = catalog.products.filter((p) => p.status === "active");
	let count = 0;
	for (const [i, customer] of users.customers.slice(0, 4).entries()) {
		const product = sample(products, 1)[0];
		const completed = i % 2 === 0;
		await prisma.virtualTryOnSession.create({
			data: {
				userId: customer.id,
				productId: product.id,
				personImageUrl: imageUrl(`person-${i}`),
				garmentImageUrl: product.media[0]?.url ?? imageUrl(`garment-${i}`),
				status: completed ? "completed" : "queued",
				resultUrl: completed ? imageUrl(`tryon-result-${i}`) : null,
				clothType: pick(["upper", "lower", "overall"]),
			},
		});
		count++;
	}
	return count;
}
