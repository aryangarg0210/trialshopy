import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Secrets live in the server app's local .env (loaded from the db package cwd).
config({ path: "../../apps/server/.env" });

export default defineConfig({
	// Multi-file schema: every *.prisma file under prisma/schema/ is merged.
	schema: "./prisma/schema",
	datasource: {
		url: process.env.DATABASE_URL,
	},
});
