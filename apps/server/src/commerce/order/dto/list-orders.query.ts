import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class ListOrdersQuery {
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

	@ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.pending })
	@IsOptional()
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@ApiPropertyOptional({ description: "Filter by customer id (admin)" })
	@IsOptional()
	@IsMongoId()
	customerId?: string;
}
