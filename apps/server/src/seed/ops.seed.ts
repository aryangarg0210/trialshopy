import type { PrismaClient } from "@repo/db";
import type { SeededCatalog } from "./catalog.seed";
import { pick } from "./helpers";
import type { SeededUsers } from "./users.seed";

const TICKET_STATUSES = [
	"open",
	"in_progress",
	"resolved",
	"cancelled",
] as const;

export async function seedOps(
	prisma: PrismaClient,
	users: SeededUsers,
	catalog: SeededCatalog,
): Promise<{ tickets: number; couriers: number }> {
	let tickets = 0;
	for (let i = 0; i < 6; i++) {
		const profile = users.sellerProfiles[i % users.sellerProfiles.length];
		const store = catalog.stores.find((s) => s.sellerId === profile.id);
		const status = TICKET_STATUSES[i % TICKET_STATUSES.length];
		const resolved = status === "resolved";
		await prisma.ticket.create({
			data: {
				issueRegarding: pick([
					"Payments",
					"Shipping",
					"Product listing",
					"Account",
				]),
				sellerName: `${profile.firstName} ${profile.lastName}`,
				sellerId: profile.id,
				storeId: store?.id ?? null,
				problemStatement:
					"Facing an issue with the seller dashboard, please assist.",
				phoneNumber: "+919000000010",
				resolved,
				status,
				responseFromAdmin: resolved
					? "Resolved — the issue was fixed on our end."
					: "",
			},
		});
		tickets++;
	}

	const couriers = [
		{ name: "Delhivery", pref: "recommended", claim: 92, reverse: 40, days: 4 },
		{ name: "BlueDart", pref: "recommended", claim: 88, reverse: 55, days: 3 },
		{ name: "Ecom Express", pref: "custom", claim: 80, reverse: 35, days: 5 },
	] as const;
	for (const c of couriers) {
		await prisma.courierPartner.create({
			data: {
				preference: c.pref,
				courierPartner: c.name,
				reverseShippingCharge: c.reverse,
				avgReturnTimeDays: c.days,
				claimsRaised: 12,
				claimApprovalPercentage: c.claim,
			},
		});
	}

	return { tickets, couriers: couriers.length };
}
