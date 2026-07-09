import { ApiProperty } from "@nestjs/swagger";
import { CouponDomainResponseDto } from "./coupon-domain.response";

export class PaginatedCouponDomainsResponseDto {
	@ApiProperty({ type: [CouponDomainResponseDto] })
	data!: CouponDomainResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
