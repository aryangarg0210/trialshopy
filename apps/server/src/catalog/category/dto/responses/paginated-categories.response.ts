import { ApiProperty } from "@nestjs/swagger";
import { CategoryResponseDto } from "./category.response";

export class PaginatedCategoriesResponseDto {
	@ApiProperty({ type: [CategoryResponseDto] })
	data!: CategoryResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
