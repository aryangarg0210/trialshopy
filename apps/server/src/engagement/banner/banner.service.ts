import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BannerService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
	}

	upsert(category: string, url: string) {
		return this.prisma.banner.upsert({
			where: { category },
			create: { category, url },
			update: { url },
		});
	}

	async removeByCategory(category: string) {
		const banner = await this.prisma.banner.findUnique({
			where: { category },
			select: { id: true },
		});
		if (!banner) throw new NotFoundException("Banner not found");
		await this.prisma.banner.delete({ where: { category } });
		return { deleted: true };
	}
}
