import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { BannerService } from "./banner.service";
import { BannerResponseDto } from "./dto/responses/banner.response";
import { UpsertBannerDto } from "./dto/upsert-banner.dto";

@ApiTags("banners")
@Controller("banners")
export class BannerController {
	constructor(private readonly bannerService: BannerService) {}

	@Get()
	@AllowAnonymous()
	@ApiOperation({ summary: "List all banners (public)" })
	@ApiOkResponse({ type: [BannerResponseDto] })
	findAll() {
		return this.bannerService.findAll();
	}

	@Put(":category")
	@Roles(["admin"])
	@ApiOperation({
		summary: "Create or replace a banner for a category (admin)",
	})
	@ApiOkResponse({ type: BannerResponseDto })
	upsert(@Param("category") category: string, @Body() dto: UpsertBannerDto) {
		return this.bannerService.upsert(category, dto.url);
	}

	@Delete(":category")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a banner by category (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("category") category: string) {
		return this.bannerService.removeByCategory(category);
	}
}
