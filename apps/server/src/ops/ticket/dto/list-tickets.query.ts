import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsIn,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";
import { TICKET_STATUSES } from "./respond-ticket.dto";

export class ListTicketsQuery {
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

	@ApiPropertyOptional({ enum: TICKET_STATUSES })
	@IsOptional()
	@IsIn(TICKET_STATUSES)
	status?: (typeof TICKET_STATUSES)[number];

	@ApiPropertyOptional({ example: true })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	resolved?: boolean;

	@ApiPropertyOptional({ description: "Filter by seller profile id" })
	@IsOptional()
	@IsMongoId()
	sellerId?: string;

	@ApiPropertyOptional({ description: "Filter by store id" })
	@IsOptional()
	@IsMongoId()
	storeId?: string;
}
