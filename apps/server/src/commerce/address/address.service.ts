import { Injectable, NotFoundException } from "@nestjs/common";
import { AddressOwnerType, GenericStatus, type Prisma } from "@repo/db";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateAddressDto } from "./dto/create-address.dto";
import type { ListAddressesQuery } from "./dto/list-addresses.query";
import type { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: string, dto: CreateAddressDto) {
		return this.prisma.address.create({
			data: { ...dto, ownerId: userId, ownerType: AddressOwnerType.user },
		});
	}

	async listMine(userId: string) {
		return this.prisma.address.findMany({
			where: {
				ownerId: userId,
				ownerType: AddressOwnerType.user,
				status: GenericStatus.active,
			},
			orderBy: { updatedAt: "desc" },
		});
	}

	async getMineOne(userId: string, id: string) {
		return this.assertOwned(userId, id);
	}

	async updateMine(userId: string, id: string, dto: UpdateAddressDto) {
		await this.assertOwned(userId, id);
		return this.prisma.address.update({ where: { id }, data: dto });
	}

	async softDeleteMine(userId: string, id: string) {
		await this.assertOwned(userId, id);
		await this.prisma.address.update({
			where: { id },
			data: { status: GenericStatus.inactive },
		});
		return { deactivated: true };
	}

	async list(query: ListAddressesQuery) {
		const { page, limit, ownerType, ownerId, city, status } = query;
		const where: Prisma.AddressWhereInput = {};
		if (ownerType) where.ownerType = ownerType;
		if (ownerId) where.ownerId = ownerId;
		if (city) where.city = { contains: city, mode: "insensitive" };
		if (status) where.status = status;

		const [data, total] = await this.prisma.$transaction([
			this.prisma.address.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.address.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const address = await this.prisma.address.findUnique({ where: { id } });
		if (!address) throw new NotFoundException("Address not found");
		return address;
	}

	private async assertOwned(userId: string, id: string) {
		const address = await this.prisma.address.findUnique({ where: { id } });
		if (
			!address ||
			address.ownerType !== AddressOwnerType.user ||
			address.ownerId !== userId
		)
			throw new NotFoundException("Address not found");
		return address;
	}
}
