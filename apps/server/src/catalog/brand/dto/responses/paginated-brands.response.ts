import { ApiProperty } from "@nestjs/swagger";
import { BrandResponseDto } from "./brand.response";

export class PaginatedBrandsResponseDto {
	@ApiProperty({ type: [BrandResponseDto] })
	data!: BrandResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
