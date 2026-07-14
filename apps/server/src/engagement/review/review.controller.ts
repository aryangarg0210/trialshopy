import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	AllowAnonymous,
	Roles,
	Session,
	type UserSession,
} from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ListReviewsQuery } from "./dto/list-reviews.query";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { PaginatedReviewsResponseDto } from "./dto/responses/paginated-reviews.response";
import { ReviewResponseDto } from "./dto/responses/review.response";
import { ReviewReactionDto } from "./dto/review-reaction.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ReviewService } from "./review.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Post()
	@ApiOperation({ summary: "Write a review for a product" })
	@ApiOkResponse({ type: ReviewResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateReviewDto,
	) {
		return this.reviewService.create(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's reviews" })
	@ApiOkResponse({ type: PaginatedReviewsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListReviewsQuery,
	) {
		return this.reviewService.listMine(session.user.id, query);
	}

	@Patch("mine/:id")
	@ApiOperation({ summary: "Update one of the current user's reviews" })
	@ApiOkResponse({ type: ReviewResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateReviewDto,
	) {
		return this.reviewService.updateMine(session.user.id, id, dto);
	}

	@Delete("mine/:id")
	@ApiOperation({ summary: "Delete one of the current user's reviews" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.reviewService.deleteMine(session.user.id, id);
	}

	@Put(":id/reaction")
	@ApiOperation({ summary: "Like, dislike, or clear a reaction on a review" })
	@ApiOkResponse({ type: ReviewResponseDto })
	react(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: ReviewReactionDto,
	) {
		return this.reviewService.react(session.user.id, id, dto.reaction);
	}

	@Get("product/:productId")
	@AllowAnonymous()
	@ApiOperation({ summary: "List active reviews for a product (public)" })
	@ApiOkResponse({ type: PaginatedReviewsResponseDto })
	listByProduct(
		@Param("productId") productId: string,
		@Query() query: ListReviewsQuery,
	) {
		return this.reviewService.listByProduct(productId, query);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List reviews (admin)" })
	@ApiOkResponse({ type: PaginatedReviewsResponseDto })
	list(@Query() query: ListReviewsQuery) {
		return this.reviewService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a review by id (admin)" })
	@ApiOkResponse({ type: ReviewResponseDto })
	getById(@Param("id") id: string) {
		return this.reviewService.getById(id);
	}

	@Patch(":id/status")
	@Roles(["admin"])
	@ApiOperation({ summary: "Moderate a review's status (admin)" })
	@ApiOkResponse({ type: ReviewResponseDto })
	moderate(@Param("id") id: string, @Body() dto: ModerateReviewDto) {
		return this.reviewService.moderate(id, dto.status);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a review (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeById(@Param("id") id: string) {
		return this.reviewService.deleteById(id);
	}
}
