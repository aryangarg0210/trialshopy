import "dotenv/config";

export const config = {
	environment: process.env.NODE_ENV || "development",
	host: process.env.HOST || "0.0.0.0",
	port: Number.parseInt(process.env.PORT || "3001", 10),
	betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
	betterAuthUrl: process.env.BETTER_AUTH_URL || "",
	google: {
		clientId: process.env.GOOGLE_CLIENT_ID || "",
		clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
	},
	urls: {
		frontend: process.env.FRONTEND_URL || "http://localhost:3000",
		api: process.env.API_URL || "http://localhost:3001",
		cors: process.env.CORS_URLS?.split(",") || ["http://localhost:3000"],
		db:
			process.env.DATABASE_URL ||
			"mongodb://localhost:27017/trialshopy?replicaSet=rs0",
	},
	redis: {
		host: process.env.REDIS_HOST ?? "localhost",
		port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
		password: process.env.REDIS_PASSWORD,
	},
	smtp: {
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT || "587", 10),
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
		from: process.env.SMTP_FROM,
	},
	bullBoard: {
		user: process.env.BULL_BOARD_USER || "admin",
		password: process.env.BULL_BOARD_PASSWORD || "admin",
	},
};
