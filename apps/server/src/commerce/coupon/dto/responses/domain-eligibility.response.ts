import { ApiProperty } from "@nestjs/swagger";
import { CouponType } from "@repo/db";

export class DomainEligibilityResponseDto {
	@ApiProperty({ example: true })
	eligible!: boolean;

	@ApiProperty({ enum: CouponType, example: CouponType.college })
	couponType!: CouponType;

	@ApiProperty({ nullable: true, example: "mit.edu" })
	domain!: string | null;

	@ApiProperty({
		nullable: true,
		description: "Discount percentage if eligible",
		example: 15,
	})
	discount!: number | null;
}
