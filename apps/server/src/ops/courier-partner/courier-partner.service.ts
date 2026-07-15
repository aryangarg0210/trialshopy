import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateCourierPartnerDto } from "./dto/create-courier-partner.dto";
import type { ListCourierPartnersQuery } from "./dto/list-courier-partners.query";
import type { UpdateCourierPartnerDto } from "./dto/update-courier-partner.dto";

@Injectable()
export class CourierPartnerService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateCourierPartnerDto) {
		return this.prisma.courierPartner.create({ data: dto });
	}

	async list(query: ListCourierPartnersQuery) {
		const { page, limit, preference } = query;
		const where: Prisma.CourierPartnerWhereInput = {};
		if (preference) where.preference = preference;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.courierPartner.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.courierPartner.count({ where }),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const partner = await this.prisma.courierPartner.findUnique({
			where: { id },
		});
		if (!partner) throw new NotFoundException("Courier partner not found");
		return partner;
	}

	async update(id: string, dto: UpdateCourierPartnerDto) {
		await this.getById(id);
		return this.prisma.courierPartner.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.getById(id);
		await this.prisma.courierPartner.delete({ where: { id } });
		return { deleted: true };
	}
}
