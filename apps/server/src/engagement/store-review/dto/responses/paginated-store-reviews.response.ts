import { ApiProperty } from "@nestjs/swagger";
import { StoreReviewResponseDto } from "./store-review.response";

export class PaginatedStoreReviewsResponseDto {
	@ApiProperty({ type: [StoreReviewResponseDto] })
	data!: StoreReviewResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
