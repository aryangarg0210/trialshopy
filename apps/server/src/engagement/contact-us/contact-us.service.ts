import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateContactUsDto } from "./dto/create-contact-us.dto";
import type { ListContactUsQuery } from "./dto/list-contact-us.query";

@Injectable()
export class ContactUsService {
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateContactUsDto) {
		return this.prisma.contactUs.create({ data: dto });
	}

	async list(query: ListContactUsQuery) {
		const { page, limit } = query;
		const [data, total] = await this.prisma.$transaction([
			this.prisma.contactUs.findMany({
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.contactUs.count(),
		]);
		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async findOne(id: string) {
		const entry = await this.prisma.contactUs.findUnique({ where: { id } });
		if (!entry) throw new NotFoundException("Contact request not found");
		return entry;
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.contactUs.delete({ where: { id } });
		return { deleted: true };
	}
}
