import { ApiProperty } from "@nestjs/swagger";
import { ReviewResponseDto } from "./review.response";

export class PaginatedReviewsResponseDto {
	@ApiProperty({ type: [ReviewResponseDto] })
	data!: ReviewResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
