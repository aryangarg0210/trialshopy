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
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateStoreDto } from "./dto/create-store.dto";
import { ListStoresQuery } from "./dto/list-stores.query";
import { PaginatedStoresResponseDto } from "./dto/responses/paginated-stores.response";
import { StoreResponseDto } from "./dto/responses/store.response";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { UpdateVerificationDto } from "./dto/update-verification.dto";
import { StoreService } from "./store.service";

@ApiTags("stores")
@Controller("stores")
export class StoreController {
	constructor(private readonly storeService: StoreService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Create the current seller's store" })
	@ApiOkResponse({ type: StoreResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateStoreDto,
	) {
		return this.storeService.create(session.user.id, dto);
	}

	@Get("me")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get the current seller's store" })
	@ApiOkResponse({ type: StoreResponseDto })
	getMine(@Session() session: UserSession<typeof auth>) {
		return this.storeService.getMine(session.user.id);
	}

	@Patch("me")
	@Roles(["seller"])
	@ApiOperation({ summary: "Update the current seller's store" })
	@ApiOkResponse({ type: StoreResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: UpdateStoreDto,
	) {
		return this.storeService.updateMine(session.user.id, dto);
	}

	@Delete("me")
	@Roles(["seller"])
	@ApiOperation({ summary: "Deactivate the current seller's store" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	removeMine(@Session() session: UserSession<typeof auth>) {
		return this.storeService.softDeleteMine(session.user.id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List stores (admin)" })
	@ApiOkResponse({ type: PaginatedStoresResponseDto })
	list(@Query() query: ListStoresQuery) {
		return this.storeService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a store by id (admin)" })
	@ApiOkResponse({ type: StoreResponseDto })
	getById(@Param("id") id: string) {
		return this.storeService.getById(id);
	}

	@Patch(":id/verification")
	@Roles(["admin"])
	@ApiOperation({ summary: "Set a store's verification status (admin)" })
	@ApiOkResponse({ type: StoreResponseDto })
	setVerification(@Param("id") id: string, @Body() dto: UpdateVerificationDto) {
		return this.storeService.setVerification(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Soft-delete a store (admin)" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	removeById(@Param("id") id: string) {
		return this.storeService.softDeleteById(id);
	}
}
