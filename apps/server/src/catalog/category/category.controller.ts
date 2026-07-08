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
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ListCategoriesQuery } from "./dto/list-categories.query";
import {
	CategoryDetailResponseDto,
	CategoryResponseDto,
	CategoryTreeNodeResponseDto,
} from "./dto/responses/category.response";
import { PaginatedCategoriesResponseDto } from "./dto/responses/paginated-categories.response";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags("categories")
@Controller("categories")
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post()
	@Roles(["admin"])
	@ApiOperation({ summary: "Create a category (admin)" })
	@ApiOkResponse({ type: CategoryResponseDto })
	create(@Body() dto: CreateCategoryDto) {
		return this.categoryService.create(dto);
	}

	@Get()
	@ApiOperation({ summary: "List categories" })
	@ApiOkResponse({ type: PaginatedCategoriesResponseDto })
	list(@Query() query: ListCategoriesQuery) {
		return this.categoryService.list(query);
	}

	@Get("tree")
	@ApiOperation({ summary: "Full category hierarchy" })
	@ApiOkResponse({ type: [CategoryTreeNodeResponseDto] })
	tree() {
		return this.categoryService.tree();
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a category with its parent and children" })
	@ApiOkResponse({ type: CategoryDetailResponseDto })
	findOne(@Param("id") id: string) {
		return this.categoryService.findOne(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a category (admin)" })
	@ApiOkResponse({ type: CategoryResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
		return this.categoryService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Soft-delete a category (admin)" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	remove(@Param("id") id: string) {
		return this.categoryService.softDelete(id);
	}
}
