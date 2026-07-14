import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateFaqDto } from "./dto/create-faq.dto";
import type { UpdateFaqDto } from "./dto/update-faq.dto";

@Injectable()
export class FaqService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateFaqDto) {
		const existing = await this.prisma.faq.findFirst({
			where: { question: dto.question },
			select: { id: true },
		});
		if (existing) throw new ConflictException("This question already exists");
		return this.prisma.faq.create({ data: dto });
	}

	findAll() {
		return this.prisma.faq.findMany({ orderBy: { createdAt: "desc" } });
	}

	async findOne(id: string) {
		const faq = await this.prisma.faq.findUnique({ where: { id } });
		if (!faq) throw new NotFoundException("FAQ not found");
		return faq;
	}

	async update(id: string, dto: UpdateFaqDto) {
		await this.findOne(id);
		return this.prisma.faq.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.faq.delete({ where: { id } });
		return { deleted: true };
	}
}
