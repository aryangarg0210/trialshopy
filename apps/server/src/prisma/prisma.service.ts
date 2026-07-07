import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";
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

	private readonly logger = new Logger(PrismaService.name);

	async onModuleInit() {
		try {
			await this.$connect();
		} catch (error) {
			console.error("Failed to connect to database:", error);
			throw error;
		}
		await this.ensureIndexes();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}

	// Indexes that Prisma cannot express in the Mongo schema. A partial unique
	// index enforces phone-number uniqueness only when a phone is actually set,
	// so multiple email/password users without a phone can coexist.
	private async ensureIndexes() {
		try {
			await this.$runCommandRaw({
				createIndexes: "user",
				indexes: [
					{
						key: { phone_number: 1 },
						name: "user_phone_number_unique",
						unique: true,
						partialFilterExpression: { phone_number: { $type: "string" } },
					},
				],
			});
		} catch (error) {
			this.logger.warn(
				`Failed to ensure user phone-number index: ${error instanceof Error ? error.message : error}`,
			);
		}
	}
}
