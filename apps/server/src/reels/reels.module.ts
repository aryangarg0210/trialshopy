import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";
import { ReelsController } from "./reels.controller";
import { ReelsService } from "./reels.service";

@Module({
	imports: [PrismaModule, UploadModule],
	controllers: [ReelsController],
	providers: [ReelsService],
	exports: [ReelsService],
})
export class ReelsModule {}
