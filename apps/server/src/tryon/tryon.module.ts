import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CloudinaryService } from "./cloudinary.service";
import { TryOnProcessor } from "./processors/tryon.processor";
import { TryOnBridgeService } from "./tryon-bridge.service";
import { TryOnController } from "./tryon.controller";
import { TryOnGateway } from "./tryon.gateway";
import { TryOnService } from "./tryon.service";
import { TRYON_QUEUE } from "./tryon.types";

/**
 * TryOnModule
 *
 * Self-contained NestJS feature module for Virtual Try-On.
 *
 * Provides:
 *  - TryOnController      → REST endpoints (POST /tryon/generate, GET sessions)
 *  - TryOnGateway         → Socket.io WebSocket namespace /tryon
 *  - TryOnService         → Orchestrator (validation, Cloudinary upload, DB, BullMQ enqueue)
 *  - TryOnBridgeService   → HTTP client for the Python Flask bridge
 *  - CloudinaryService    → Base64 → Cloudinary URL upload
 *  - TryOnProcessor       → BullMQ worker (async inference + EventEmitter)
 *  - BullMQ Queue         → `virtual-try-on` queue
 *
 * Dependencies injected from root:
 *  - PrismaModule         → database access
 *  - EventEmitterModule   → already registered in AppModule (forRoot)
 *  - BullModule (root)    → already registered in AppModule (forRoot with Redis)
 */
@Module({
	imports: [
		PrismaModule,
		// Register the feature queue (inherits Redis connection from BullModule.forRoot)
		BullModule.registerQueue({ name: TRYON_QUEUE }),
	],
	controllers: [TryOnController],
	providers: [
		TryOnService,
		TryOnBridgeService,
		CloudinaryService,
		TryOnGateway,
		TryOnProcessor,
	],
	exports: [TryOnService],
})
export class TryOnModule {}
