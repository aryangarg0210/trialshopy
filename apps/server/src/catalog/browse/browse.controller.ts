import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { BrandService } from "../brand/brand.service";
import { PaginatedBrandsResponseDto } from "../brand/dto/responses/paginated-brands.response";
import { CategoryService } from "../category/category.service";
import { CategoryTreeNodeResponseDto } from "../category/dto/responses/category.response";
import { PaginatedCategoriesResponseDto } from "../category/dto/responses/paginated-categories.response";
import { PaginatedProductsResponseDto } from "../product/dto/responses/paginated-products.response";
import { ProductDetailResponseDto } from "../product/dto/responses/product-detail.response";
import { ProductService } from "../product/product.service";
import { StoreResponseDto } from "../store/dto/responses/store.response";
import { StoreService } from "../store/store.service";
import { BrowseBrandsQuery } from "./dto/browse-brands.query";
import { BrowseCategoriesQuery } from "./dto/browse-categories.query";
import { BrowseProductsQuery } from "./dto/browse-products.query";

@ApiTags("public")
@Controller("public")
export class BrowseController {
	constructor(
		private readonly productService: ProductService,
		private readonly categoryService: CategoryService,
		private readonly brandService: BrandService,
		private readonly storeService: StoreService,
	) {}

	@Get("products")
	@AllowAnonymous()
	@ApiOperation({ summary: "Browse active products (public)" })
	@ApiOkResponse({ type: PaginatedProductsResponseDto })
	browseProducts(@Query() query: BrowseProductsQuery) {
		return this.productService.browsePublic(query);
	}

	@Get("products/:id")
	@AllowAnonymous()
	@ApiOperation({ summary: "Get an active product by id (public)" })
	@ApiOkResponse({ type: ProductDetailResponseDto })
	getProduct(@Param("id") id: string) {
		return this.productService.getPublic(id);
	}

	@Get("categories")
	@AllowAnonymous()
	@ApiOperation({ summary: "Browse active categories (public)" })
	@ApiOkResponse({ type: PaginatedCategoriesResponseDto })
	browseCategories(@Query() query: BrowseCategoriesQuery) {
		return this.categoryService.browsePublic(query);
	}

	@Get("categories/tree")
	@AllowAnonymous()
	@ApiOperation({ summary: "Get the active category tree (public)" })
	@ApiOkResponse({ type: CategoryTreeNodeResponseDto, isArray: true })
	categoryTree() {
		return this.categoryService.publicTree();
	}

	@Get("brands")
	@AllowAnonymous()
	@ApiOperation({ summary: "Browse active brands (public)" })
	@ApiOkResponse({ type: PaginatedBrandsResponseDto })
	browseBrands(@Query() query: BrowseBrandsQuery) {
		return this.brandService.browsePublic(query);
	}

	@Get("stores/:id")
	@AllowAnonymous()
	@ApiOperation({ summary: "Get an active store by id (public)" })
	@ApiOkResponse({ type: StoreResponseDto })
	getStore(@Param("id") id: string) {
		return this.storeService.getPublic(id);
	}
}
