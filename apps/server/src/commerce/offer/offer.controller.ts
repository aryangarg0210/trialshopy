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
import { AdminCreateOfferDto } from "./dto/admin-create-offer.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { ListOffersQuery } from "./dto/list-offers.query";
import { OfferResponseDto } from "./dto/responses/offer.response";
import { PaginatedOffersResponseDto } from "./dto/responses/paginated-offers.response";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OfferService } from "./offer.service";

@ApiTags("offers")
@Controller("offers")
export class OfferController {
	constructor(private readonly offerService: OfferService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Create an offer for the current seller's store" })
	@ApiOkResponse({ type: OfferResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateOfferDto,
	) {
		return this.offerService.create(session.user.id, dto);
	}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List the current seller's store offers" })
	@ApiOkResponse({ type: PaginatedOffersResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListOffersQuery,
	) {
		return this.offerService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get one of the current seller's offers" })
	@ApiOkResponse({ type: OfferResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.offerService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Update one of the current seller's offers" })
	@ApiOkResponse({ type: OfferResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateOfferDto,
	) {
		return this.offerService.updateMine(session.user.id, id, dto);
	}

	@Delete("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Delete one of the current seller's offers" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.offerService.deleteMine(session.user.id, id);
	}

	@Post("admin")
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a store or brand offer (admin)" })
	@ApiOkResponse({ type: OfferResponseDto })
	adminCreate(@Body() dto: AdminCreateOfferDto) {
		return this.offerService.adminCreate(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List offers (admin)" })
	@ApiOkResponse({ type: PaginatedOffersResponseDto })
	list(@Query() query: ListOffersQuery) {
		return this.offerService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get an offer by id (admin)" })
	@ApiOkResponse({ type: OfferResponseDto })
	getById(@Param("id") id: string) {
		return this.offerService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update an offer (admin)" })
	@ApiOkResponse({ type: OfferResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateOfferDto) {
		return this.offerService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete an offer (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	removeById(@Param("id") id: string) {
		return this.offerService.deleteById(id);
	}
}
