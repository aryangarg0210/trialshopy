import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class WishlistService {
	constructor(private readonly prisma: PrismaService) {}

	async list(userId: string) {
		const profile = await this.prisma.customerProfile.findUnique({
			where: { userId },
			select: { wishlistIds: true },
		});
		if (!profile?.wishlistIds.length) return { data: [] };

		const data = await this.prisma.product.findMany({
			where: { id: { in: profile.wishlistIds }, status: "active" },
		});
		return { data };
	}

	async add(userId: string, productId: string) {
		const product = await this.prisma.product.count({
			where: { id: productId, status: "active" },
		});
		if (!product) throw new NotFoundException("Product not found");

		const profileId = await this.ensureProfileId(userId);
		await this.prisma.$runCommandRaw({
			update: "customer_profile",
			updates: [
				{
					q: { _id: { $oid: profileId } },
					u: { $addToSet: { wishlist_ids: { $oid: productId } } },
				},
			],
		});
		return { added: true };
	}

	async remove(userId: string, productId: string) {
		const profileId = await this.ensureProfileId(userId);
		await this.prisma.$runCommandRaw({
			update: "customer_profile",
			updates: [
				{
					q: { _id: { $oid: profileId } },
					u: { $pull: { wishlist_ids: { $oid: productId } } },
				},
			],
		});
		return { removed: true };
	}

	private async ensureProfileId(userId: string) {
		const profile = await this.prisma.customerProfile.upsert({
			where: { userId },
			create: { userId },
			update: {},
			select: { id: true },
		});
		return profile.id;
	}
}
