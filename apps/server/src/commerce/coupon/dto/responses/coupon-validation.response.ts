import { ApiProperty } from "@nestjs/swagger";

export class CouponValidationResponseDto {
	@ApiProperty({ example: true })
	valid!: boolean;

	@ApiProperty({ example: "MONSOON20" })
	code!: string;

	@ApiProperty({ description: "Discount percentage applied", example: 20 })
	discountPercent!: number;

	@ApiProperty({
		description: "Discount amount for the given purchase",
		example: 240,
	})
	discountAmount!: number;

	@ApiProperty({ description: "Amount payable after discount", example: 960 })
	payableAmount!: number;
}
