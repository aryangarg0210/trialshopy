import {
	ConflictException,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { ProfileStatus, UserRole } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterSellerDto } from "./dto/register-seller.dto";
import type { SubmitKycDto } from "./dto/submit-kyc.dto";
import type { UpdateSellerProfileDto } from "./dto/update-seller-profile.dto";

@Injectable()
export class SellerProfileService {
	constructor(private readonly prisma: PrismaService) {}

	async get(userId: string) {
		return this.prisma.sellerProfile.findUnique({ where: { userId } });
	}

	async register(userId: string, dto: RegisterSellerDto) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});
		if (user?.role !== UserRole.customer)
			throw new ConflictException(
				"Only a customer account can register as a seller.",
			);

		const existing = await this.prisma.sellerProfile.findUnique({
			where: { userId },
		});
		if (existing) throw new ConflictException("Seller profile already exists");

		const [profile] = await this.prisma.$transaction([
			this.prisma.sellerProfile.create({ data: { userId, ...dto } }),
			this.prisma.user.update({
				where: { id: userId },
				data: { role: UserRole.seller },
			}),
		]);
		return profile;
	}

	async update(userId: string, dto: UpdateSellerProfileDto) {
		await this.ensureSeller(userId);
		return this.prisma.sellerProfile.update({ where: { userId }, data: dto });
	}

	async submitKyc(userId: string, dto: SubmitKycDto) {
		await this.ensureSeller(userId);
		return this.prisma.sellerProfile.update({
			where: { userId },
			data: { kyc: { ...dto, status: ProfileStatus.pending } },
		});
	}

	private async ensureSeller(userId: string) {
		const profile = await this.prisma.sellerProfile.findUnique({
			where: { userId },
		});
		if (!profile)
			throw new ForbiddenException(
				"You are not a registered seller. Complete seller registration first.",
			);
		return profile;
	}
}
