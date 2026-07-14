import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
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
import { CreateStoreReviewDto } from "./dto/create-store-review.dto";
import { ListStoreReviewsQuery } from "./dto/list-store-reviews.query";
import { ModerateStoreReviewDto } from "./dto/moderate-store-review.dto";
import { PaginatedStoreReviewsResponseDto } from "./dto/responses/paginated-store-reviews.response";
import { StoreReviewResponseDto } from "./dto/responses/store-review.response";
import { UpdateStoreReviewDto } from "./dto/update-store-review.dto";
import { StoreReviewService } from "./store-review.service";

@ApiTags("store-reviews")
@Controller("store-reviews")
export class StoreReviewController {
	constructor(private readonly storeReviewService: StoreReviewService) {}

	@Post()
	@ApiOperation({ summary: "Write a review for a store" })
	@ApiOkResponse({ type: StoreReviewResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateStoreReviewDto,
	) {
		return this.storeReviewService.create(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's store reviews" })
	@ApiOkResponse({ type: PaginatedStoreReviewsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListStoreReviewsQuery,
	) {
		return this.storeReviewService.listMine(session.user.id, query);
	}

	@Patch("mine/:id")
	@ApiOperation({ summary: "Update one of the current user's store reviews" })
	@ApiOkResponse({ type: StoreReviewResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateStoreReviewDto,
	) {
		return this.storeReviewService.updateMine(session.user.id, id, dto);
	}

	@Delete("mine/:id")
	@ApiOperation({ summary: "Delete one of the current user's store reviews" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.storeReviewService.deleteMine(session.user.id, id);
	}

	@Get("store/:storeId")
	@AllowAnonymous()
	@ApiOperation({ summary: "List active reviews for a store (public)" })
	@ApiOkResponse({ type: PaginatedStoreReviewsResponseDto })
	listByStore(
		@Param("storeId") storeId: string,
		@Query() query: ListStoreReviewsQuery,
	) {
		return this.storeReviewService.listByStore(storeId, query);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List store reviews (admin)" })
	@ApiOkResponse({ type: PaginatedStoreReviewsResponseDto })
	list(@Query() query: ListStoreReviewsQuery) {
		return this.storeReviewService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a store review by id (admin)" })
	@ApiOkResponse({ type: StoreReviewResponseDto })
	getById(@Param("id") id: string) {
		return this.storeReviewService.getById(id);
	}

	@Patch(":id/status")
	@Roles(["admin"])
	@ApiOperation({ summary: "Moderate a store review's status (admin)" })
	@ApiOkResponse({ type: StoreReviewResponseDto })
	moderate(@Param("id") id: string, @Body() dto: ModerateStoreReviewDto) {
		return this.storeReviewService.moderate(id, dto.status);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a store review (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeById(@Param("id") id: string) {
		return this.storeReviewService.deleteById(id);
	}
}
