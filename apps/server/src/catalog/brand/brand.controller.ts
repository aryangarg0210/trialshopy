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
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { ListBrandsQuery } from "./dto/list-brands.query";
import { BrandResponseDto } from "./dto/responses/brand.response";
import { PaginatedBrandsResponseDto } from "./dto/responses/paginated-brands.response";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@ApiTags("brands")
@Controller("brands")
export class BrandController {
	constructor(private readonly brandService: BrandService) {}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a brand (admin)" })
	@ApiOkResponse({ type: BrandResponseDto })
	create(@Body() dto: CreateBrandDto) {
		return this.brandService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "List brands" })
	@ApiOkResponse({ type: PaginatedBrandsResponseDto })
	list(@Query() query: ListBrandsQuery) {
		return this.brandService.list(query);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a brand by id" })
	@ApiOkResponse({ type: BrandResponseDto })
	findOne(@Param("id") id: string) {
		return this.brandService.findOne(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a brand (admin)" })
	@ApiOkResponse({ type: BrandResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateBrandDto) {
		return this.brandService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Soft-delete a brand (admin)" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	remove(@Param("id") id: string) {
		return this.brandService.softDelete(id);
	}
}
