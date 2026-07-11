import { Module } from "@nestjs/common";
import { BrandController } from "./brand/brand.controller";
import { BrandService } from "./brand/brand.service";
import { BrowseController } from "./browse/browse.controller";
import { CategoryController } from "./category/category.controller";
import { CategoryService } from "./category/category.service";
import { ProductController } from "./product/product.controller";
import { ProductService } from "./product/product.service";
import { VariantController } from "./product/variant.controller";
import { VariantService } from "./product/variant.service";
import { StoreController } from "./store/store.controller";
import { StoreService } from "./store/store.service";

@Module({
	controllers: [
		CategoryController,
		BrandController,
		StoreController,
		ProductController,
		VariantController,
		BrowseController,
	],
	providers: [
		CategoryService,
		BrandService,
		StoreService,
		ProductService,
		VariantService,
	],
})
export class CatalogModule {}
