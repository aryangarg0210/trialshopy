import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@repo/db";
import { config } from "src/common/config";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		// MongoDB connects through the datasource `url` in schema.prisma
		// (no driver adapter, unlike the Postgres template).
		super({
			datasourceUrl: config.urls.db,
			log: ["error", "warn", "info"],
			errorFormat: "pretty",
		});
	}

	async onModuleInit() {
		try {
			await this.$connect();
		} catch (error) {
			console.error("Failed to connect to database:", error);
			throw error;
		}
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
