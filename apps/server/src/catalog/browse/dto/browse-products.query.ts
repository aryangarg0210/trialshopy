import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export enum ProductSort {
	Newest = "newest",
	PriceAsc = "price_asc",
	PriceDesc = "price_desc",
}

export class BrowseProductsQuery {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit = 20;

	@ApiPropertyOptional({ description: "Filter by category id" })
	@IsOptional()
	@IsMongoId()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Filter by brand id" })
	@IsOptional()
	@IsMongoId()
	brandId?: string;

	@ApiPropertyOptional({ description: "Filter by store id" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;

	@ApiPropertyOptional({ description: "Minimum base price", minimum: 0 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	minPrice?: number;

	@ApiPropertyOptional({ description: "Maximum base price", minimum: 0 })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	maxPrice?: number;

	@ApiPropertyOptional({ description: "Filter by an available variant size" })
	@IsOptional()
	@IsString()
	size?: string;

	@ApiPropertyOptional({
		description: "Search by product name",
		example: "sony",
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: ProductSort, default: ProductSort.Newest })
	@IsOptional()
	@IsEnum(ProductSort)
	sort: ProductSort = ProductSort.Newest;
}
