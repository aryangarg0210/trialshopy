import { auth } from "../common/auth";

export async function hashPassword(password: string): Promise<string> {
	const ctx = await auth.$context;
	return ctx.password.hash(password);
}

export function media(seed: string) {
	return {
		url: `https://picsum.photos/seed/${seed}/800/800`,
		publicId: `trialshopy/seed/${seed}`,
	};
}

export function imageUrl(seed: string) {
	return `https://picsum.photos/seed/${seed}/800/800`;
}

export function videoUrl(seed: string) {
	return `https://res.cloudinary.com/demo/video/upload/reels/${seed}.mp4`;
}

export function geo(lng: number, lat: number) {
	return { type: "Point", coordinates: [lng, lat] };
}

export function daysAgo(n: number): Date {
	return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export function daysFromNow(n: number): Date {
	return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

export function makeRng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const rng = makeRng(20260716);

export function rand(): number {
	return rng();
}

export function int(min: number, max: number): number {
	return Math.floor(rand() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
	return arr[Math.floor(rand() * arr.length)];
}

export function sample<T>(arr: T[], count: number): T[] {
	const copy = [...arr];
	const out: T[] = [];
	for (let i = 0; i < count && copy.length; i++) {
		out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
	}
	return out;
}

export function round2(n: number): number {
	return Math.round(n * 100) / 100;
}
