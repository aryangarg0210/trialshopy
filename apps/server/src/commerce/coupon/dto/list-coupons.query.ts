import { ApiPropertyOptional } from "@nestjs/swagger";
import { CouponStatus } from "@repo/db";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListCouponsQuery {
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

	@ApiPropertyOptional({ description: "Search by coupon code" })
	@IsOptional()
	@IsString()
	search?: string;
}
