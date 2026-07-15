import { ApiProperty } from "@nestjs/swagger";
import { TicketResponseDto } from "./ticket.response";

export class PaginatedTicketsResponseDto {
	@ApiProperty({ type: [TicketResponseDto] })
	data!: TicketResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
