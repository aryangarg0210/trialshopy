import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env file
config();

export default defineConfig({
	// Multi-file schema: every *.prisma file under prisma/schema/ is merged.
	schema: "./prisma/schema",
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
