import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProfileStatus } from "@repo/db";
import { PrismaService } from "../prisma/prisma.service";
import type { ListUsersQuery } from "./dto/list-users.query";
import type { UpdateUserDto } from "./dto/update-user.dto";

const withProfiles = {
	customerProfile: true,
	sellerProfile: true,
} satisfies Prisma.UserInclude;

const SELF_DEACTIVATION_REASON = "Account deactivated by user";

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getMe(userId: string) {
		return this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
			include: withProfiles,
		});
	}

	async updateBaseUser(userId: string, dto: UpdateUserDto) {
		return this.prisma.user.update({
			where: { id: userId },
			data: dto,
			include: withProfiles,
		});
	}

	async deactivateSelf(userId: string) {
		await this.prisma.$transaction([
			this.prisma.user.update({
				where: { id: userId },
				data: { banned: true, banReason: SELF_DEACTIVATION_REASON },
			}),
			this.prisma.customerProfile.updateMany({
				where: { userId },
				data: { status: ProfileStatus.inactive },
			}),
			this.prisma.sellerProfile.updateMany({
				where: { userId },
				data: { status: ProfileStatus.inactive },
			}),
			this.prisma.session.deleteMany({ where: { userId } }),
		]);
		return { deactivated: true };
	}

	async list(query: ListUsersQuery) {
		const { page, limit, role, banned, search } = query;
		const where: Prisma.UserWhereInput = {};
		if (role) where.role = role;
		if (banned !== undefined) where.banned = banned;
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ email: { contains: search, mode: "insensitive" } },
				{ phoneNumber: { contains: search, mode: "insensitive" } },
			];
		}

		const [data, total] = await this.prisma.$transaction([
			this.prisma.user.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.user.count({ where }),
		]);

		return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
	}

	async getById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: withProfiles,
		});
		if (!user) throw new NotFoundException("User not found");
		return user;
	}
}
