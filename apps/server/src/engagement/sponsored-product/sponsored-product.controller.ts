import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { CreateSponsoredProductDto } from "./dto/create-sponsored-product.dto";
import { SponsoredProductResponseDto } from "./dto/responses/sponsored-product.response";
import { SponsoredProductService } from "./sponsored-product.service";

@ApiTags("sponsored-products")
@Controller("sponsored-products")
export class SponsoredProductController {
	constructor(
		private readonly sponsoredProductService: SponsoredProductService,
	) {}

	@Get()
	@AllowAnonymous()
	@ApiOperation({ summary: "List sponsored products (public)" })
	@ApiOkResponse({ type: [SponsoredProductResponseDto] })
	findAll() {
		return this.sponsoredProductService.findAll();
	}

	@Get("subcategory/:subcategoryId")
	@AllowAnonymous()
	@ApiOperation({
		summary: "List sponsored products for a subcategory (public)",
	})
	@ApiOkResponse({ type: [SponsoredProductResponseDto] })
	findBySubcategory(@Param("subcategoryId") subcategoryId: string) {
		return this.sponsoredProductService.findBySubcategory(subcategoryId);
	}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a sponsored product (admin)" })
	@ApiOkResponse({ type: SponsoredProductResponseDto })
	create(@Body() dto: CreateSponsoredProductDto) {
		return this.sponsoredProductService.create(dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Delete a sponsored product (admin)" })
	@ApiOkResponse({ schema: { example: { deleted: true } } })
	remove(@Param("id") id: string) {
		return this.sponsoredProductService.remove(id);
	}
}
