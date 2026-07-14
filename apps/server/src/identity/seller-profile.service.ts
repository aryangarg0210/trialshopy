import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { type Prisma, ProfileStatus, UserRole } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { ListKycQuery } from "./dto/list-kyc.query";
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

	async adminListKyc(query: ListKycQuery) {
		const { page, limit, status } = query;
		const where: Prisma.SellerProfileWhereInput = status
			? { kyc: { is: { status } } }
			: { kyc: { isSet: true } };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.sellerProfile.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { updatedAt: "desc" },
			}),
			this.prisma.sellerProfile.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async adminGetKyc(id: string) {
		const profile = await this.prisma.sellerProfile.findUnique({
			where: { id },
		});
		if (!profile) throw new NotFoundException("Seller profile not found");
		return profile;
	}

	async adminSetKycStatus(id: string, status: ProfileStatus) {
		const profile = await this.adminGetKyc(id);
		if (!profile.kyc)
			throw new BadRequestException("This seller has not submitted KYC");
		return this.prisma.sellerProfile.update({
			where: { id },
			data: { kyc: { ...profile.kyc, status } },
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
