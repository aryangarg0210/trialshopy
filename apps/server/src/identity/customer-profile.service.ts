import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateCustomerProfileDto } from "./dto/update-customer-profile.dto";

@Injectable()
export class CustomerProfileService {
	constructor(private readonly prisma: PrismaService) {}

	async get(userId: string) {
		return this.prisma.customerProfile.findUnique({ where: { userId } });
	}

	async upsert(userId: string, dto: UpdateCustomerProfileDto) {
		return this.prisma.customerProfile.upsert({
			where: { userId },
			create: { userId, ...dto },
			update: dto,
		});
	}
}
