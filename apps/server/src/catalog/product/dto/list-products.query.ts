import { ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class ListProductsQuery {
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

	@ApiPropertyOptional({ enum: CatalogStatus, example: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;

	@ApiPropertyOptional({ description: "Filter by brand id" })
	@IsOptional()
	@IsMongoId()
	brandId?: string;

	@ApiPropertyOptional({ description: "Filter by category id" })
	@IsOptional()
	@IsMongoId()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Filter by store id (admin)" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;

	@ApiPropertyOptional({ description: "Filter by seller profile id (admin)" })
	@IsOptional()
	@IsMongoId()
	sellerId?: string;

	@ApiPropertyOptional({
		description: "Search by product name",
		example: "sony",
	})
	@IsOptional()
	@IsString()
	search?: string;
}
