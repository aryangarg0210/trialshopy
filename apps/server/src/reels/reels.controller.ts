import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	AllowAnonymous,
	Session,
	type UserSession,
} from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { CommentReelDto } from "./dto/comment-reel.dto";
import { CreateReelDto } from "./dto/create-reel.dto";
import { ListReelsQuery } from "./dto/list-reels.query";
import { ReelReactionDto } from "./dto/reel-reaction.dto";
import { PaginatedReelsResponseDto } from "./dto/responses/paginated-reels.response";
import { ReelResponseDto } from "./dto/responses/reel.response";
import { ReelsService } from "./reels.service";

@ApiTags("reels")
@Controller("reels")
export class ReelsController {
	constructor(private readonly reelsService: ReelsService) {}

	@Post()
	@ApiOperation({
		summary: "Publish a new reel (video uploaded via signed upload)",
	})
	@ApiOkResponse({ type: ReelResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateReelDto,
	) {
		return this.reelsService.create(session.user.id, session.user.role, dto);
	}

	@Get()
	@AllowAnonymous()
	@ApiOperation({ summary: "Global reels feed (public)" })
	@ApiOkResponse({ type: PaginatedReelsResponseDto })
	findAll(@Query() query: ListReelsQuery) {
		return this.reelsService.findAll(query);
	}

	@Get("me")
	@ApiOperation({ summary: "Reels published by the current user" })
	@ApiOkResponse({ type: PaginatedReelsResponseDto })
	findMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListReelsQuery,
	) {
		return this.reelsService.findByAuthor(session.user.id, query);
	}

	@Get(":id")
	@AllowAnonymous()
	@ApiOperation({ summary: "Get a single reel (public)" })
	@ApiOkResponse({ type: ReelResponseDto })
	getById(@Param("id") id: string) {
		return this.reelsService.getById(id);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete one of the current user's reels" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.reelsService.remove(id, session.user.id);
	}

	@Put(":id/reaction")
	@ApiOperation({ summary: "Like, dislike, or clear a reaction on a reel" })
	@ApiOkResponse({ type: ReelResponseDto })
	react(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: ReelReactionDto,
	) {
		return this.reelsService.react(id, session.user.id, dto.reaction);
	}

	@Post(":id/comments")
	@ApiOperation({ summary: "Add a comment to a reel" })
	@ApiOkResponse({ type: ReelResponseDto })
	addComment(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: CommentReelDto,
	) {
		return this.reelsService.addComment(id, session.user.id, dto);
	}
}
