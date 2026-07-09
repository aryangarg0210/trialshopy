import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CouponStatus, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCouponDto } from "./dto/create-coupon.dto";
import type { ListCouponsQuery } from "./dto/list-coupons.query";
import type { UpdateCouponDto } from "./dto/update-coupon.dto";
import type { ValidateCouponDto } from "./dto/validate-coupon.dto";

@Injectable()
export class CouponService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCouponDto) {
		this.assertWindow(dto.validFrom, dto.validTo);
		try {
			return await this.prisma.coupon.create({ data: dto });
		} catch (error) {
			throw this.toWriteError(error);
		}
	}

	async list(query: ListCouponsQuery) {
		const { page, limit, status, search } = query;
		const where: Prisma.CouponWhereInput = {};
		if (status) where.status = status;
		if (search) where.code = { contains: search, mode: "insensitive" };

		const [data, total] = await this.prisma.$transaction([
			this.prisma.coupon.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.coupon.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const coupon = await this.prisma.coupon.findUnique({ where: { id } });
		if (!coupon) throw new NotFoundException("Coupon not found");
		return coupon;
	}

	async update(id: string, dto: UpdateCouponDto) {
		const coupon = await this.getById(id);
		this.assertWindow(
			dto.validFrom ?? coupon.validFrom,
			dto.validTo ?? coupon.validTo,
		);
		try {
			return await this.prisma.coupon.update({ where: { id }, data: dto });
		} catch (error) {
			throw this.toWriteError(error);
		}
	}

	async softDelete(id: string) {
		await this.getById(id);
		await this.prisma.coupon.update({
			where: { id },
			data: { status: CouponStatus.inactive },
		});
		return { deleted: true };
	}

	async validate(dto: ValidateCouponDto) {
		const coupon = await this.prisma.coupon.findUnique({
			where: { code: dto.code },
		});
		if (!coupon) throw new NotFoundException("Coupon not found");

		if (coupon.status !== CouponStatus.active)
			throw new BadRequestException("This coupon is not active");

		const now = new Date();
		if (now < coupon.validFrom || now > coupon.validTo)
			throw new BadRequestException("This coupon is not valid at this time");

		if (dto.purchaseAmount < coupon.minimumPurchaseAmount)
			throw new BadRequestException(
				`A minimum purchase of ${coupon.minimumPurchaseAmount} is required for this coupon`,
			);

		const discountAmount = this.round(
			(dto.purchaseAmount * coupon.discount) / 100,
		);
		return {
			valid: true,
			code: coupon.code,
			discountPercent: coupon.discount,
			discountAmount,
			payableAmount: this.round(dto.purchaseAmount - discountAmount),
		};
	}

	private assertWindow(validFrom: string | Date, validTo: string | Date) {
		if (new Date(validFrom) >= new Date(validTo))
			throw new BadRequestException("validFrom must be before validTo");
	}

	private round(value: number) {
		return Math.round(value * 100) / 100;
	}

	private toWriteError(error: unknown) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		)
			return new ConflictException("A coupon with this code already exists");
		return error;
	}
}
