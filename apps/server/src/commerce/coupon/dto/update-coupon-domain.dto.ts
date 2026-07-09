import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CouponStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { CreateCouponDomainDto } from "./create-coupon-domain.dto";

export class UpdateCouponDomainDto extends PartialType(CreateCouponDomainDto) {
	@ApiPropertyOptional({ enum: CouponStatus })
	@IsOptional()
	@IsEnum(CouponStatus)
	status?: CouponStatus;
}
