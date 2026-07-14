import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { ContactUsService } from "./contact-us.service";
import { CreateContactUsDto } from "./dto/create-contact-us.dto";
import { ListContactUsQuery } from "./dto/list-contact-us.query";
import { ContactUsResponseDto } from "./dto/responses/contact-us.response";

@ApiTags("contact-us")
@Controller("contact-us")
export class ContactUsController {
	constructor(private readonly contactUsService: ContactUsService) {}

	@Post()
	@AllowAnonymous()
	@ApiOperation({ summary: "Submit a contact request (public)" })
	@ApiOkResponse({ type: ContactUsResponseDto })
	create(@Body() dto: CreateContactUsDto) {
		return this.contactUsService.create(dto);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List contact requests (admin)" })
	list(@Query() query: ListContactUsQuery) {
		return this.contactUsService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a contact request by id (admin)" })
	@ApiOkResponse({ type: ContactUsResponseDto })
	findOne(@Param("id") id: string) {
		return this.contactUsService.findOne(id);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a contact request (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.contactUsService.remove(id);
	}
}
