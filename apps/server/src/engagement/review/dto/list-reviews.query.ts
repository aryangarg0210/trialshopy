import { ApiPropertyOptional } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class ListReviewsQuery {
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

	@ApiPropertyOptional({ description: "Filter by product id" })
	@IsOptional()
	@IsMongoId()
	productId?: string;

	@ApiPropertyOptional({ description: "Filter by author user id" })
	@IsOptional()
	@IsMongoId()
	userId?: string;

	@ApiPropertyOptional({ enum: GenericStatus })
	@IsOptional()
	@IsEnum(GenericStatus)
	status?: GenericStatus;
}
