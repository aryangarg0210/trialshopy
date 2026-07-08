import { ApiProperty } from "@nestjs/swagger";
import { OrderResponseDto } from "./order.response";

export class PaginatedOrdersResponseDto {
	@ApiProperty({ type: [OrderResponseDto] })
	data!: OrderResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
