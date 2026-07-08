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
import { CreateProductDto } from "./dto/create-product.dto";
import { ListProductsQuery } from "./dto/list-products.query";
import { PaginatedProductsResponseDto } from "./dto/responses/paginated-products.response";
import { ProductDetailResponseDto } from "./dto/responses/product-detail.response";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductService } from "./product.service";

@ApiTags("products")
@Controller("products")
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Create a product in the current seller's store" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateProductDto,
	) {
		return this.productService.create(session.user.id, dto);
	}

	@Get("mine")
	@Roles(["seller"])
	@ApiOperation({ summary: "List the current seller's products" })
	@ApiOkResponse({ type: PaginatedProductsResponseDto })
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListProductsQuery,
	) {
		return this.productService.listMine(session.user.id, query);
	}

	@Get("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Get one of the current seller's products" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	getMineOne(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.productService.getMineOne(session.user.id, id);
	}

	@Patch("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Update one of the current seller's products" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	updateMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
		@Body() dto: UpdateProductDto,
	) {
		return this.productService.updateMine(session.user.id, id, dto);
	}

	@Delete("mine/:id")
	@Roles(["seller"])
	@ApiOperation({ summary: "Deactivate one of the current seller's products" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	removeMine(
		@Session() session: UserSession<typeof auth>,
		@Param("id") id: string,
	) {
		return this.productService.softDeleteMine(session.user.id, id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List products (admin)" })
	@ApiOkResponse({ type: PaginatedProductsResponseDto })
	list(@Query() query: ListProductsQuery) {
		return this.productService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a product by id (admin)" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	getById(@Param("id") id: string) {
		return this.productService.getById(id);
	}

	@Patch(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Update a product (admin)" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
		return this.productService.update(id, dto);
	}

	@Delete(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Soft-delete a product (admin)" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	removeById(@Param("id") id: string) {
		return this.productService.softDeleteById(id);
	}
}
