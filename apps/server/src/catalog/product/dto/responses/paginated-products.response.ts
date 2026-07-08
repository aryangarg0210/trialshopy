import { ApiProperty } from "@nestjs/swagger";
import { ProductResponseDto } from "./product.response";

export class PaginatedProductsResponseDto {
	@ApiProperty({ type: [ProductResponseDto] })
	data!: ProductResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
