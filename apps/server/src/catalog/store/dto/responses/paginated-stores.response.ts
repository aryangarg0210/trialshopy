import { ApiProperty } from "@nestjs/swagger";
import { StoreResponseDto } from "./store.response";

export class PaginatedStoresResponseDto {
	@ApiProperty({ type: [StoreResponseDto] })
	data!: StoreResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
