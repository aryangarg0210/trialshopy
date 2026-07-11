import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";

export class PaymentResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6260" })
	storeId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6299" })
	suborderId!: string | null;

	@ApiProperty({ nullable: true, example: 12 })
	totalItems!: number | null;

	@ApiProperty({ nullable: true, example: 1500 })
	balance!: number | null;

	@ApiProperty({ nullable: true, example: 5000 })
	totalRevenue!: number | null;

	@ApiProperty({ nullable: true, example: 4700 })
	finalPrice!: number | null;

	@ApiProperty({ nullable: true, example: 150 })
	sgst!: number | null;

	@ApiProperty({ nullable: true, example: 150 })
	cgst!: number | null;

	@ApiProperty({ enum: GenericStatus, example: GenericStatus.active })
	status!: GenericStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
