import { ApiProperty } from "@nestjs/swagger";
import { PaymentResponseDto } from "./payment.response";

export class PaginatedPaymentsResponseDto {
	@ApiProperty({ type: [PaymentResponseDto] })
	data!: PaymentResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
