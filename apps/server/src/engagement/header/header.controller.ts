import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { CreateHeaderDto } from "./dto/create-header.dto";
import { HeaderResponseDto } from "./dto/responses/header.response";
import { UpdateHeaderDto } from "./dto/update-header.dto";
import { HeaderService } from "./header.service";

@ApiTags("headers")
@Controller("headers")
export class HeaderController {
	constructor(private readonly headerService: HeaderService) {}

	@Get("subcategory/:subcategoryId")
	@AllowAnonymous()
	@ApiOperation({ summary: "List headers for a subcategory (public)" })
	@ApiOkResponse({ type: [HeaderResponseDto] })
	findBySubcategory(@Param("subcategoryId") subcategoryId: string) {
		return this.headerService.findBySubcategory(subcategoryId);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a header (admin)" })
	@ApiOkResponse({ type: HeaderResponseDto })
	create(@Body() dto: CreateHeaderDto) {
		return this.headerService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List headers (admin)" })
	@ApiOkResponse({ type: [HeaderResponseDto] })
	list() {
		return this.headerService.list();
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a header by id (admin)" })
	@ApiOkResponse({ type: HeaderResponseDto })
	findOne(@Param("id") id: string) {
		return this.headerService.findOne(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a header (admin)" })
	@ApiOkResponse({ type: HeaderResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateHeaderDto) {
		return this.headerService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a header (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.headerService.remove(id);
	}
}
