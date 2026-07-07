import { PrismaClient } from "@repo/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, bearer, emailOTP, jwt } from "better-auth/plugins";
import { MailService } from "src/mail/mail.service";
import { emailOTPTemplate } from "src/mail/templates";
import { config } from "./config";

const mailService = new MailService();

// MongoDB connects through the datasource `url` in schema.prisma
// (no driver adapter, unlike the Postgres template).
const prismaClient = new PrismaClient({
	datasourceUrl: config.urls.db,
});

// Biometric (passkey) is intentionally deferred — no legacy contract to match
// and it needs WebAuthn integration on the mobile client. Added in a later pass.
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
		admin({
			defaultRole: "customer",
			adminRoles: ["admin"],
		}),
		bearer(),
		jwt(),
	],
	socialProviders: {
		google: {
			clientId: config.google.clientId,
			clientSecret: config.google.clientSecret,
		},
	},
});

export type AuthSession = typeof auth.$Infer.Session.session;
export type AuthUser = typeof auth.$Infer.Session.user;
