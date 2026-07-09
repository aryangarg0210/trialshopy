import { ApiPropertyOptional } from "@nestjs/swagger";
import { CouponStatus, CouponType } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class ListStudentVerificationsQuery {
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

	@ApiPropertyOptional({ enum: CouponStatus })
	@IsOptional()
	@IsEnum(CouponStatus)
	status?: CouponStatus;

	@ApiPropertyOptional({ enum: CouponType })
	@IsOptional()
	@IsEnum(CouponType)
	couponType?: CouponType;

	@ApiPropertyOptional({ description: "Filter by user id" })
	@IsOptional()
	@IsMongoId()
	userId?: string;
}
