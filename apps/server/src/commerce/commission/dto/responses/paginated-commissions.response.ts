import { ApiProperty } from "@nestjs/swagger";
import { CommissionResponseDto } from "./commission.response";

export class PaginatedCommissionsResponseDto {
	@ApiProperty({ type: [CommissionResponseDto] })
	data!: CommissionResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
