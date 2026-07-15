import type {
	CustomerProfile,
	PrismaClient,
	SellerProfile,
	User,
} from "@repo/db";
import { hashPassword, media } from "./helpers";

export interface SeededUsers {
	admin: User;
	sellers: User[];
	sellerProfiles: SellerProfile[];
	customers: User[];
	customerProfiles: CustomerProfile[];
}

const SELLER_NAMES = [
	"Demo Seller",
	"Aria Threads",
	"Nova Electronics",
	"Urban Roots",
	"Peak Sports",
];

const CUSTOMER_NAMES = [
	"Demo Customer",
	"Rohan Mehta",
	"Priya Nair",
	"Kabir Shah",
	"Ananya Rao",
	"Ishaan Verma",
	"Meera Iyer",
	"Dev Kapoor",
];

async function createUser(
	prisma: PrismaClient,
	data: {
		email: string;
		name: string;
		password: string;
		role: User["role"];
		phoneNumber?: string;
	},
): Promise<User> {
	const user = await prisma.user.create({
		data: {
			name: data.name,
			email: data.email,
			emailVerified: true,
			role: data.role,
			phoneNumber: data.phoneNumber ?? null,
			phoneNumberVerified: Boolean(data.phoneNumber),
		},
	});
	await prisma.account.create({
		data: {
			userId: user.id,
			accountId: user.id,
			providerId: "credential",
			password: await hashPassword(data.password),
		},
	});
	return user;
}

const KYC_STATUSES = ["active", "pending", "inactive"] as const;

export async function seedUsers(prisma: PrismaClient): Promise<SeededUsers> {
	const admin = await createUser(prisma, {
		email: "admin@trialshopy.com",
		name: "Super Admin",
		password: "Admin@12345",
		role: "admin",
	});

	const sellers: User[] = [];
	const sellerProfiles: SellerProfile[] = [];
	for (let i = 0; i < SELLER_NAMES.length; i++) {
		const email =
			i === 0 ? "seller@trialshopy.com" : `seller${i + 1}@trialshopy.com`;
		const user = await createUser(prisma, {
			email,
			name: SELLER_NAMES[i],
			password: "Seller@12345",
			role: "seller",
			phoneNumber: `+9190000000${10 + i}`,
		});
		const [firstName, ...rest] = SELLER_NAMES[i].split(" ");
		const kycStatus = KYC_STATUSES[i % KYC_STATUSES.length];
		const profile = await prisma.sellerProfile.create({
			data: {
				userId: user.id,
				sellerCode: `SELL-${1000 + i}`,
				firstName,
				lastName: rest.join(" ") || firstName,
				profilePic: media(`seller-${i}`),
				languages: ["English", "Hindi"],
				status: "active",
				kyc: {
					status: kycStatus,
					fullName: SELLER_NAMES[i],
					panNumber: `ABCDE${1000 + i}F`,
					gstin: `27ABCDE${1000 + i}F1Z5`,
					accountNumber: `9000000000${i}`,
					ifscCode: "HDFC0001234",
					documents: [{ name: "PAN Card", url: media(`kyc-${i}`).url }],
				},
			},
		});
		sellers.push(user);
		sellerProfiles.push(profile);
	}

	const customers: User[] = [];
	const customerProfiles: CustomerProfile[] = [];
	for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
		const email =
			i === 0 ? "customer@trialshopy.com" : `customer${i + 1}@trialshopy.com`;
		const user = await createUser(prisma, {
			email,
			name: CUSTOMER_NAMES[i],
			password: "Customer@12345",
			role: "customer",
			phoneNumber: `+9191111111${10 + i}`,
		});
		const profile = await prisma.customerProfile.create({
			data: {
				userId: user.id,
				gender: i % 2 === 0 ? "male" : "female",
				dateOfBirth: "1998-04-12",
				profilePic: media(`customer-${i}`),
				languages: ["English"],
				status: "active",
			},
		});
		customers.push(user);
		customerProfiles.push(profile);
	}

	return { admin, sellers, sellerProfiles, customers, customerProfiles };
}
