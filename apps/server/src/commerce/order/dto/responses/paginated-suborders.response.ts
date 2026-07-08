import { ApiProperty } from "@nestjs/swagger";
import { SubOrderResponseDto } from "./suborder.response";

export class PaginatedSubOrdersResponseDto {
	@ApiProperty({ type: [SubOrderResponseDto] })
	data!: SubOrderResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
