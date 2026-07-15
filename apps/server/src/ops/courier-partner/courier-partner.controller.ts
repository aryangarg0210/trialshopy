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
import { Roles } from "@thallesp/nestjs-better-auth";
import { CourierPartnerService } from "./courier-partner.service";
import { CreateCourierPartnerDto } from "./dto/create-courier-partner.dto";
import { ListCourierPartnersQuery } from "./dto/list-courier-partners.query";
import { CourierPartnerResponseDto } from "./dto/responses/courier-partner.response";
import { UpdateCourierPartnerDto } from "./dto/update-courier-partner.dto";

@ApiTags("courier-partners")
@Controller("courier-partners")
@Roles(["admin"])
export class CourierPartnerController {
	constructor(private readonly courierPartnerService: CourierPartnerService) {}

	@Post()
	@ApiOperation({ summary: "Create a courier partner (admin)" })
	@ApiOkResponse({ type: CourierPartnerResponseDto })
	create(@Body() dto: CreateCourierPartnerDto) {
		return this.courierPartnerService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "List courier partners (admin)" })
	@ApiOkResponse({ type: CourierPartnerResponseDto, isArray: true })
	list(@Query() query: ListCourierPartnersQuery) {
		return this.courierPartnerService.list(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a courier partner by id (admin)" })
	@ApiOkResponse({ type: CourierPartnerResponseDto })
	getById(@Param("id") id: string) {
		return this.courierPartnerService.getById(id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a courier partner (admin)" })
	@ApiOkResponse({ type: CourierPartnerResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateCourierPartnerDto) {
		return this.courierPartnerService.update(id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a courier partner (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.courierPartnerService.remove(id);
	}
}
