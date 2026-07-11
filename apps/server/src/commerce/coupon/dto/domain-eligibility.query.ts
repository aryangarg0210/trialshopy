import { ApiProperty } from "@nestjs/swagger";
import { CouponType } from "@repo/db";
import { IsEnum } from "class-validator";

export class DomainEligibilityQuery {
	@ApiProperty({ enum: CouponType, example: CouponType.college })
	@IsEnum(CouponType)
	couponType!: CouponType;
}
