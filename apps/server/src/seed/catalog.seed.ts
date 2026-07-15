import type {
	Brand,
	Category,
	PrismaClient,
	Product,
	ProductVariant,
	Store,
} from "@repo/db";
import { geo, imageUrl, int, media, pick, round2 } from "./helpers";
import type { SeededUsers } from "./users.seed";

export interface SeededCatalog {
	categories: Category[];
	rootCategories: Category[];
	childCategories: Category[];
	brands: Brand[];
	stores: Store[];
	products: Product[];
	variants: ProductVariant[];
}

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["Black", "White", "Navy", "Olive", "Maroon"];
const CITIES: [string, string, string, number, number][] = [
	["Mumbai", "Maharashtra", "400001", 72.87, 19.07],
	["Bengaluru", "Karnataka", "560001", 77.59, 12.97],
	["Delhi", "Delhi", "110001", 77.21, 28.61],
	["Pune", "Maharashtra", "411001", 73.85, 18.52],
	["Chennai", "Tamil Nadu", "600001", 80.27, 13.08],
];

export async function seedCatalog(
	prisma: PrismaClient,
	users: SeededUsers,
): Promise<SeededCatalog> {
	const roots: Category[] = [];
	for (const [name, desc] of [
		["Men", "Menswear and accessories"],
		["Women", "Womenswear and accessories"],
		["Electronics", "Phones, laptops and gadgets"],
		["Home & Living", "Decor, furniture and essentials"],
	]) {
		roots.push(
			await prisma.category.create({
				data: {
					name,
					description: desc,
					image: media(`cat-${name}`),
					featured: true,
					discount: int(0, 10),
					attributes: [
						{ name: "Size", type: "select", options: SIZES },
						{ name: "Color", type: "select", options: COLORS },
					],
				},
			}),
		);
	}

	const childSpec: [string, string][] = [
		["T-Shirts", "Men"],
		["Shirts", "Men"],
		["Dresses", "Women"],
		["Handbags", "Women"],
		["Smartphones", "Electronics"],
		["Laptops", "Electronics"],
		["Decor", "Home & Living"],
	];
	const children: Category[] = [];
	for (const [name, parentName] of childSpec) {
		const parent = roots.find((r) => r.name === parentName)!;
		children.push(
			await prisma.category.create({
				data: {
					name,
					description: `${name} in ${parentName}`,
					image: media(`cat-${name}`),
					parentId: parent.id,
					discount: int(0, 15),
				},
			}),
		);
	}
	const categories = [...roots, ...children];

	const brands: Brand[] = [];
	for (const [i, name] of [
		"Aria",
		"Nova",
		"Urban Roots",
		"Peak",
		"Kasa",
	].entries()) {
		brands.push(
			await prisma.brand.create({
				data: {
					name,
					description: `${name} official brand store`,
					logo: media(`brand-${name}`),
					categoryIds: categories.slice(i, i + 2).map((c) => c.id),
					isPopular: i < 2,
					status: "active",
				},
			}),
		);
	}

	const stores: Store[] = [];
	for (let i = 0; i < users.sellerProfiles.length; i++) {
		const profile = users.sellerProfiles[i];
		const [city, state, pincode, lng, lat] = CITIES[i % CITIES.length];
		stores.push(
			await prisma.store.create({
				data: {
					sellerId: profile.id,
					storeName: `${profile.firstName}'s Store`,
					storeDescription: `Curated products from ${profile.firstName}`,
					gstId: `27ABCDE${1000 + i}F1Z5`,
					images: [media(`store-${i}-1`), media(`store-${i}-2`)],
					status: i === 4 ? "inactive" : "active",
					verification:
						i === 0 ? "verified" : i === 1 ? "processing" : "submitted",
					categoryIds: categories.slice(0, 3).map((c) => c.id),
					openingHours: [
						{ dayOfWeek: "Mon-Sat", openTime: "10:00", closeTime: "20:00" },
					],
					location: geo(lng, lat),
					addressLine: `${100 + i}, Market Road`,
					city,
					state,
					pincode,
					country: "India",
				},
			}),
		);
	}
	const activeStores = stores.filter((s) => s.status === "active");

	const products: Product[] = [];
	const variants: ProductVariant[] = [];
	const PRODUCT_NAMES = [
		"Cotton Crew Tee",
		"Linen Casual Shirt",
		"Floral Summer Dress",
		"Leather Tote Bag",
		"Aurora 5G Smartphone",
		"UltraBook Pro 14",
		"Ceramic Table Lamp",
		"Merino Wool Sweater",
		"Denim Slim Jeans",
		"Running Shoes X",
		"Noise Cancelling Buds",
		"Stainless Water Bottle",
	];

	let skuCounter = 1000;
	for (let i = 0; i < 24; i++) {
		const store = activeStores[i % activeStores.length];
		const brand = pick(brands);
		const category = pick(children);
		const basePrice = round2(int(499, 9999));
		const discount = pick([0, 5, 10, 15, 20]);
		const status = i % 8 === 7 ? "inactive" : "active";
		const product = await prisma.product.create({
			data: {
				storeId: store.id,
				sellerId: store.sellerId,
				brandId: brand.id,
				categoryId: category.id,
				categoryIds: [category.id, category.parentId!].filter(Boolean),
				productName: `${pick(PRODUCT_NAMES)} ${i + 1}`,
				shortDescription: "A great everyday pick.",
				fullDescription:
					"High quality materials, comfortable fit and durable build. Perfect for daily use.",
				status,
				tags: ["new", "trending", category.name.toLowerCase()],
				media: [media(`prod-${i}-1`), media(`prod-${i}-2`)],
				basePrice,
				mrp: round2(basePrice * 1.25),
				discount,
				stock: int(10, 200),
				color: pick(COLORS),
				material: "Premium blend",
				countryOfOrigin: "India",
				features: ["Durable", "Comfortable", "Easy care"],
				attributes: [{ title: "Fit", value: "Regular" }],
				specifications: [{ title: "Warranty", value: "6 months" }],
				markNew: i % 3 === 0,
				showOnHome: i % 4 === 0,
			},
		});
		products.push(product);

		const variantCount = int(2, 3);
		for (let v = 0; v < variantCount; v++) {
			const vPrice = round2(basePrice + int(-100, 300));
			variants.push(
				await prisma.productVariant.create({
					data: {
						productId: product.id,
						sku: `SKU-${skuCounter++}`,
						skuId: `SKU-${skuCounter}`,
						color: pick(COLORS),
						size: SIZES[v % SIZES.length],
						price: vPrice,
						mrp: round2(vPrice * 1.25),
						discount,
						stock: int(5, 60),
						media: [media(`prod-${i}-var-${v}`)],
						status: "active",
					},
				}),
			);
		}
	}

	// relate a few products to each other
	for (let i = 0; i < products.length; i++) {
		const related = products
			.filter((_, j) => j !== i && j % 5 === i % 5)
			.slice(0, 3)
			.map((p) => p.id);
		await prisma.product.update({
			where: { id: products[i].id },
			data: { relatedProductIds: related },
		});
	}

	void imageUrl;
	return {
		categories,
		rootCategories: roots,
		childCategories: children,
		brands,
		stores,
		products,
		variants,
	};
}
