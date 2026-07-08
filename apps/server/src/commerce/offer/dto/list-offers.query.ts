import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class ListOffersQuery {
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

	@ApiPropertyOptional({ description: "Filter by store id" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;

	@ApiPropertyOptional({ description: "Filter by brand id" })
	@IsOptional()
	@IsMongoId()
	brandId?: string;

	@ApiPropertyOptional({
		description: "Only offers currently within their valid window",
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	active?: boolean;
}
