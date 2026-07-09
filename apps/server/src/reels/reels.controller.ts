import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
	ParseIntPipe,
	DefaultValuePipe,
	BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { ReelsService } from "./reels.service";
import { CreateReelDto } from "./dto/create-reel.dto";
import { CommentReelDto } from "./dto/comment-reel.dto";

@ApiTags("reels")
@Controller("reels")
export class ReelsController {
	constructor(private readonly reelsService: ReelsService) {}

	@Post()
	@UseInterceptors(FileInterceptor("video"))
	@ApiConsumes("multipart/form-data")
	@ApiOperation({ summary: "Upload a new reel video" })
	async uploadReel(
		@Session() session: UserSession<typeof auth>,
		@Body() createReelDto: CreateReelDto,
		@UploadedFile() file?: any,
	) {
		if (!file) {
			throw new BadRequestException("Video file is required");
		}
		
		// In a real app we might determine authorType from roles.
		// For simplicity, we map "customer" for generic users and "seller" for sellers.
		const authorType = session.user.role === "seller" ? "seller" : "customer";

		return this.reelsService.createReel(
			session.user.id,
			authorType,
			file.buffer,
			createReelDto,
		);
	}

	@Get()
	@ApiOperation({ summary: "Get all reels for global feed" })
	async getAllReels(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
	) {
		return this.reelsService.findAll(page, limit);
	}

	@Get("me")
	@ApiOperation({ summary: "Get reels uploaded by current user" })
	async getMyReels(
		@Session() session: UserSession<typeof auth>,
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
	) {
		return this.reelsService.findByAuthor(session.user.id, page, limit);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a reel" })
	async deleteReel(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.reelsService.deleteReel(id, session.user.id);
	}

	@Post(":id/like")
	@ApiOperation({ summary: "Toggle like on a reel" })
	async toggleLike(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.reelsService.toggleLike(id, session.user.id);
	}

	@Post(":id/dislike")
	@ApiOperation({ summary: "Toggle dislike on a reel" })
	async toggleDislike(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.reelsService.toggleDislike(id, session.user.id);
	}

	@Post(":id/comments")
	@ApiOperation({ summary: "Add a comment to a reel" })
	async addComment(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() commentDto: CommentReelDto,
	) {
		return this.reelsService.addComment(id, session.user.id, commentDto);
	}
}
