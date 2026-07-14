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
import { CreateFaqDto } from "./dto/create-faq.dto";
import { FaqResponseDto } from "./dto/responses/faq.response";
import { UpdateFaqDto } from "./dto/update-faq.dto";
import { FaqService } from "./faq.service";

@ApiTags("faqs")
@Controller("faqs")
export class FaqController {
	constructor(private readonly faqService: FaqService) {}

	@Get()
	@AllowAnonymous()
	@ApiOperation({ summary: "List all FAQs (public)" })
	@ApiOkResponse({ type: [FaqResponseDto] })
	findAll() {
		return this.faqService.findAll();
	}

	@Get(":id")
	@AllowAnonymous()
	@ApiOperation({ summary: "Get an FAQ by id (public)" })
	@ApiOkResponse({ type: FaqResponseDto })
	findOne(@Param("id") id: string) {
		return this.faqService.findOne(id);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create an FAQ (admin)" })
	@ApiOkResponse({ type: FaqResponseDto })
	create(@Body() dto: CreateFaqDto) {
		return this.faqService.create(dto);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update an FAQ (admin)" })
	@ApiOkResponse({ type: FaqResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateFaqDto) {
		return this.faqService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete an FAQ (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.faqService.remove(id);
	}
}
