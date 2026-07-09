import { ApiProperty } from "@nestjs/swagger";
import { CouponResponseDto } from "./coupon.response";

export class PaginatedCouponsResponseDto {
	@ApiProperty({ type: [CouponResponseDto] })
	data!: CouponResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
