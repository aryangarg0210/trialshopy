import { ApiProperty } from "@nestjs/swagger";

export class TicketResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ nullable: true, example: "Payout not received" })
	issueRegarding!: string | null;

	@ApiProperty({ nullable: true, example: "Nova Store" })
	sellerName!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6260" })
	sellerId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6268" })
	storeId!: string | null;

	@ApiProperty({ nullable: true, example: "Settlement pending for last week." })
	problemStatement!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	phoneNumber!: string | null;

	@ApiProperty({ type: [String], example: [] })
	images!: string[];

	@ApiProperty({ example: false })
	resolved!: boolean;

	@ApiProperty({ example: "open" })
	status!: string;

	@ApiProperty({ nullable: true, example: "" })
	responseFromAdmin!: string | null;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	updatedAt!: Date;
}
