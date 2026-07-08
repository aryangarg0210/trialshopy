import { ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class ListBrandsQuery {
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

	@ApiPropertyOptional({ example: true })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	isPopular?: boolean;

	@ApiPropertyOptional({
		description: "Filter brands belonging to this category id",
		example: "6a4d564507ba0a597bdc6276",
	})
	@IsOptional()
	@IsMongoId()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Search by name", example: "sony" })
	@IsOptional()
	@IsString()
	search?: string;
}
