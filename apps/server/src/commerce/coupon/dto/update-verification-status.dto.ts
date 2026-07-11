import { ApiProperty } from "@nestjs/swagger";
import { CouponStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class UpdateVerificationStatusDto {
	@ApiProperty({
		enum: CouponStatus,
		description: "active = approved, inactive = rejected/pending",
		example: CouponStatus.active,
	})
	@IsEnum(CouponStatus)
	status!: CouponStatus;
}
