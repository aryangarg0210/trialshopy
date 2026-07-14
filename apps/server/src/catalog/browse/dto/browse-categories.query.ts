import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class BrowseCategoriesQuery {
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

	@ApiPropertyOptional({
		description: 'Filter by parent id, or "null" for root categories',
	})
	@IsOptional()
	@IsString()
	parentId?: string;

	@ApiPropertyOptional({ description: "Filter featured categories only" })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	featured?: boolean;

	@ApiPropertyOptional({ description: "Search by name", example: "electro" })
	@IsOptional()
	@IsString()
	search?: string;
}
