import { Injectable, NotFoundException } from "@nestjs/common";
import { CouponStatus, CouponType, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCouponDomainDto } from "./dto/create-coupon-domain.dto";
import type { ListCouponDomainsQuery } from "./dto/list-coupon-domains.query";
import type { UpdateCouponDomainDto } from "./dto/update-coupon-domain.dto";

@Injectable()
export class CouponDomainService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateCouponDomainDto) {
		return this.prisma.couponDomain.create({
			data: { ...dto, domain: this.normalize(dto.domain) },
		});
	}

	async list(query: ListCouponDomainsQuery) {
		const { page, limit, couponType, status } = query;
		const where: Prisma.CouponDomainWhereInput = {};
		if (couponType) where.couponType = couponType;
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.couponDomain.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.couponDomain.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const domain = await this.prisma.couponDomain.findUnique({ where: { id } });
		if (!domain) throw new NotFoundException("Coupon domain not found");
		return domain;
	}

	async update(id: string, dto: UpdateCouponDomainDto) {
		await this.getById(id);
		const data = dto.domain
			? { ...dto, domain: this.normalize(dto.domain) }
			: dto;
		return this.prisma.couponDomain.update({ where: { id }, data });
	}

	async softDelete(id: string) {
		await this.getById(id);
		await this.prisma.couponDomain.update({
			where: { id },
			data: { status: CouponStatus.inactive },
		});
		return { deleted: true };
	}

	async checkEligibility(email: string, couponType: CouponType) {
		const domain = this.extractDomain(email);
		const match = domain
			? await this.prisma.couponDomain.findFirst({
					where: { couponType, domain, status: CouponStatus.active },
				})
			: null;

		return {
			eligible: !!match,
			couponType,
			domain: match?.domain ?? null,
			discount: match?.discount ?? null,
		};
	}

	private extractDomain(email: string): string | null {
		const at = email.lastIndexOf("@");
		if (at === -1) return null;
		return this.normalize(email.slice(at + 1));
	}

	private normalize(domain: string) {
		return domain.trim().toLowerCase();
	}
}
