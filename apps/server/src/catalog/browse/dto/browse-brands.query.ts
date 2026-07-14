import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsMongoId,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class BrowseBrandsQuery {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit = 50;

	@ApiPropertyOptional({ description: "Filter popular brands only" })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	isPopular?: boolean;

	@ApiPropertyOptional({
		description: "Filter brands belonging to this category id",
	})
	@IsOptional()
	@IsMongoId()
	categoryId?: string;

	@ApiPropertyOptional({ description: "Search by name", example: "sony" })
	@IsOptional()
	@IsString()
	search?: string;
}
