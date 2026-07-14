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
import { AddressService } from "./address.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { ListAddressesQuery } from "./dto/list-addresses.query";
import { AddressResponseDto } from "./dto/responses/address.response";
import { PaginatedAddressesResponseDto } from "./dto/responses/paginated-addresses.response";
import { UpdateAddressDto } from "./dto/update-address.dto";

@ApiTags("addresses")
@Controller("addresses")
export class AddressController {
	constructor(private readonly addressService: AddressService) {}

	@Post()
	@ApiOperation({ summary: "Add an address to the current user's book" })
	@ApiOkResponse({ type: AddressResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateAddressDto,
	) {
		return this.addressService.create(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's addresses" })
	@ApiOkResponse({ type: [AddressResponseDto] })
	listMine(@Session() session: UserSession<typeof auth>) {
		return this.addressService.listMine(session.user.id);
	}

	@Get("mine/:id")
	@ApiOperation({ summary: "Get one of the current user's addresses" })
	@ApiOkResponse({ type: AddressResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.addressService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id")
	@ApiOperation({ summary: "Update one of the current user's addresses" })
	@ApiOkResponse({ type: AddressResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateAddressDto,
	) {
		return this.addressService.updateMine(session.user.id, id, dto);
	}

	@Patch("mine/:id/default")
	@ApiOperation({
		summary: "Set one of the current user's addresses as default",
	})
	@ApiOkResponse({ type: AddressResponseDto })
	setDefault(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.addressService.setDefault(session.user.id, id);
	}

	@Delete("mine/:id")
	@ApiOperation({ summary: "Delete one of the current user's addresses" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.addressService.softDeleteMine(session.user.id, id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List addresses (admin)" })
	@ApiOkResponse({ type: PaginatedAddressesResponseDto })
	list(@Query() query: ListAddressesQuery) {
		return this.addressService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get an address by id (admin)" })
	@ApiOkResponse({ type: AddressResponseDto })
	getById(@Param("id") id: string) {
		return this.addressService.getById(id);
	}
}
