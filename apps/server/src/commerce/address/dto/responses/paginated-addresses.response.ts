import { ApiProperty } from "@nestjs/swagger";
import { AddressResponseDto } from "./address.response";

export class PaginatedAddressesResponseDto {
	@ApiProperty({ type: [AddressResponseDto] })
	data!: AddressResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
