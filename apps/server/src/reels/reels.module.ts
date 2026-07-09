import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CloudinaryService } from "../tryon/cloudinary.service";
import { ReelsController } from "./reels.controller";
import { ReelsService } from "./reels.service";

@Module({
	imports: [PrismaModule],
	controllers: [ReelsController],
	providers: [ReelsService, CloudinaryService],
	exports: [ReelsService],
})
export class ReelsModule {}
