import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CouponStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { CreateCouponDto } from "./create-coupon.dto";

export class UpdateCouponDto extends PartialType(CreateCouponDto) {
	@ApiPropertyOptional({ enum: CouponStatus })
	@IsOptional()
	@IsEnum(CouponStatus)
	status?: CouponStatus;
}
