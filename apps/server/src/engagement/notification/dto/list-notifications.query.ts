import { ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class ListNotificationsQuery {
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

	@ApiPropertyOptional({ enum: NotificationStatus })
	@IsOptional()
	@IsEnum(NotificationStatus)
	status?: NotificationStatus;

	@ApiPropertyOptional({ description: "Filter by user id (admin only)" })
	@IsOptional()
	@IsMongoId()
	userId?: string;
}
