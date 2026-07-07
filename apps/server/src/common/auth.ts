import { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, bearer, emailOTP, jwt, phoneNumber } from "better-auth/plugins";
import { MailService } from "src/mail/mail.service";
import { emailOTPTemplate } from "src/mail/templates";
import { config } from "./config";
import { sendSms } from "./utils/sms.utils";

const mailService = new MailService();

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
			if (ctx.path !== "/phone-number/verify") return;
			if (ctx.body?.updatePhoneNumber) return;

			const existing = await prismaClient.user.findFirst({
				where: { phoneNumber: ctx.body?.phoneNumber },
			});
			if (!existing) {
				throw new APIError("NOT_FOUND", {
					code: "USER_NOT_FOUND",
					message: "No account found with this phone number.",
				});
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
	],
});

export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
