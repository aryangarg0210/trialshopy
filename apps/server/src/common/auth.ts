import { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
	admin,
	bearer,
	emailOTP,
	jwt,
	openAPI,
	phoneNumber,
} from "better-auth/plugins";
import { MailService } from "src/mail/mail.service";
import { emailOTPTemplate } from "src/mail/templates";
import { config } from "./config";
import { sendSms } from "./utils/sms.utils";

const mailService = new MailService();

// Canonicalize phone numbers to E.164 so send-otp, verify, linking, and the
// user lookup all key off the same string. Without this, a phone stored as
// "+919172312737" is unreachable when the client sends the bare "9172312737",
// producing a spurious "no account found". India (+91) is assumed for bare
// national numbers, matching the app's default country.
function normalizePhoneNumber(raw?: string): string | undefined {
	if (!raw) return raw;
	if (raw.trim().startsWith("+")) return `+${raw.replace(/\D/g, "")}`;
	const national = raw.replace(/\D/g, "").replace(/^0+/, "");
	if (national.length === 12 && national.startsWith("91"))
		return `+${national}`;
	return `+91${national}`;
}

// MongoDB connects through the datasource `url` in schema.prisma
// (no driver adapter, unlike the Postgres template).
const prismaClient = new PrismaClient({
	datasourceUrl: config.urls.db,
});

export const auth = betterAuth({
	database: prismaAdapter(prismaClient, {
		provider: "mongodb",
	}),
	trustedOrigins: config.urls.cors,
	basePath: "/api/auth",
	secret: config.betterAuthSecret,
	baseURL: config.betterAuthUrl,
	experimental: {
		joins: true,
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
	// Phone OTP is sign-in only. A verify without `updatePhoneNumber` (i.e. a login
	// attempt) for a phone no account owns must fail cleanly with "no user found"
	// instead of the plugin's internal 500 — and must never create an account.
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			const isPhonePath =
				ctx.path.startsWith("/phone-number/") ||
				ctx.path === "/sign-in/phone-number";
			if (!isPhonePath) return;

			// Normalize before the plugin runs so OTP keying, storage, and lookup agree.
			if (ctx.body?.phoneNumber) {
				ctx.body.phoneNumber = normalizePhoneNumber(ctx.body.phoneNumber);
			}

			// A verify without `updatePhoneNumber` (i.e. a login attempt) for a phone no
			// account owns must fail cleanly with "no user found" instead of the plugin's
			// internal 500 — and must never create an account.
			if (ctx.path === "/phone-number/verify" && !ctx.body?.updatePhoneNumber) {
				const existing = await prismaClient.user.findFirst({
					where: { phoneNumber: ctx.body?.phoneNumber },
				});
				if (!existing) {
					throw new APIError("NOT_FOUND", {
						code: "USER_NOT_FOUND",
						message: "No account found with this phone number.",
					});
				}
			}
		}),
	},
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				const subject = {
					"sign-in": "Sign In OTP",
					"email-verification": "Verify Your Email",
					"forget-password": "Reset Your Password",
				}[type];
				if (config.environment === "development") {
					console.log(`OTP: ${otp} for email: ${email}`);
				} else {
					await mailService.sendMail({
						to: email,
						subject,
						html: emailOTPTemplate({ otp, validity: 5 }),
					});
				}
			},
			otpLength: 6,
			expiresIn: 300,
			sendVerificationOnSignUp: true,
			allowedAttempts: 5,
		}),
		// Phone OTP is login-only. `signUpOnVerification` is intentionally omitted:
		// verifying an OTP for a phone that no account has must NOT create a user —
		// it returns "not found". Signup is email-only; existing users link a phone
		// via verify with `updatePhoneNumber: true` while authenticated.
		phoneNumber({
			async sendOTP({ phoneNumber: to, code }) {
				await sendSms({ to, message: `Your TrialShopy OTP is ${code}` });
			},
			otpLength: 6,
			expiresIn: 300,
		}),
		admin({
			defaultRole: "customer",
			adminRoles: ["admin"],
		}),
		bearer(),
		jwt(),
		// Generates an OpenAPI schema for all /api/auth/* routes. Merged into the
		// main Swagger doc in main.ts; also serves a Scalar UI at /api/auth/reference.
		openAPI(),
	],
});

export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
