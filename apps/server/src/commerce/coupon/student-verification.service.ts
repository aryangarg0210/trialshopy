import { Injectable, NotFoundException } from "@nestjs/common";
import { CouponStatus, Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { ListStudentVerificationsQuery } from "./dto/list-student-verifications.query";
import type { SubmitStudentVerificationDto } from "./dto/submit-student-verification.dto";

@Injectable()
export class StudentVerificationService {
	constructor(private readonly prisma: PrismaService) {}

	async submit(userId: string, dto: SubmitStudentVerificationDto) {
		const existing = await this.prisma.studentVerification.findFirst({
			where: { userId, couponType: dto.couponType },
			select: { id: true },
		});

		const document = { url: dto.document.url, publicId: dto.document.publicId };

		if (existing)
			return this.prisma.studentVerification.update({
				where: { id: existing.id },
				data: { document, status: CouponStatus.inactive },
			});

		return this.prisma.studentVerification.create({
			data: { userId, couponType: dto.couponType, document },
		});
	}

	listMine(userId: string) {
		return this.prisma.studentVerification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}

	async list(query: ListStudentVerificationsQuery) {
		const { page, limit, status, couponType, userId } = query;
		const where: Prisma.StudentVerificationWhereInput = {};
		if (status) where.status = status;
		if (couponType) where.couponType = couponType;
		if (userId) where.userId = userId;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.studentVerification.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.studentVerification.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async updateStatus(id: string, status: CouponStatus) {
		const found = await this.prisma.studentVerification.findUnique({
			where: { id },
			select: { id: true },
		});
		if (!found) throw new NotFoundException("Student verification not found");
		return this.prisma.studentVerification.update({
			where: { id },
			data: { status },
		});
	}
}
