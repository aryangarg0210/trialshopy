import { PrismaClient, UserRole } from "@repo/db";
import { auth } from "./common/auth";

const prisma = new PrismaClient();

interface SeedUser {
	email: string;
	password: string;
	name: string;
	role: UserRole;
}

const SEED_USERS: SeedUser[] = [
	{
		email: "admin@trialshopy.com",
		password: "Admin@12345",
		name: "Super Admin",
		role: UserRole.admin,
	},
	{
		email: "seller@trialshopy.com",
		password: "Seller@12345",
		name: "Demo Seller",
		role: UserRole.seller,
	},
	{
		email: "customer@trialshopy.com",
		password: "Customer@12345",
		name: "Demo Customer",
		role: UserRole.customer,
	},
];

async function hashPassword(password: string): Promise<string> {
	const ctx = await auth.$context;
	return ctx.password.hash(password);
}

async function upsertUserWithPassword(seed: SeedUser) {
	const password = await hashPassword(seed.password);
	const existing = await prisma.user.findUnique({
		where: { email: seed.email },
	});

	const user = existing
		? await prisma.user.update({
				where: { id: existing.id },
				data: { name: seed.name, role: seed.role, emailVerified: true },
			})
		: await prisma.user.create({
				data: {
					name: seed.name,
					email: seed.email,
					emailVerified: true,
					role: seed.role,
				},
			});

	const credential = await prisma.account.findFirst({
		where: { userId: user.id, providerId: "credential" },
	});
	if (credential) {
		await prisma.account.update({
			where: { id: credential.id },
			data: { password },
		});
	} else {
		await prisma.account.create({
			data: {
				userId: user.id,
				accountId: user.id,
				providerId: "credential",
				password,
			},
		});
	}

	return user;
}

async function ensureProfile(userId: string, seed: SeedUser) {
	if (seed.role === UserRole.customer) {
		await prisma.customerProfile.upsert({
			where: { userId },
			create: { userId },
			update: {},
		});
	}
	if (seed.role === UserRole.seller) {
		const [firstName, ...rest] = seed.name.split(" ");
		await prisma.sellerProfile.upsert({
			where: { userId },
			create: { userId, firstName, lastName: rest.join(" ") || firstName },
			update: {},
		});
	}
}

async function main() {
	for (const seed of SEED_USERS) {
		const user = await upsertUserWithPassword(seed);
		await ensureProfile(user.id, seed);
		console.log(
			`✔ ${seed.role.padEnd(9)} ${seed.email}  ·  password: ${seed.password}`,
		);
	}
}

main()
	.then(() => console.log("\nSeed complete."))
	.catch((error) => {
		console.error("Seed failed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
		process.exit(process.exitCode ?? 0);
	});
