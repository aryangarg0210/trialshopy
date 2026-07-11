import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";

export class CommissionResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6280" })
	productId!: string;

	@ApiProperty({ example: 10 })
	commission!: number;

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	datedFrom!: Date;

	@ApiProperty({ example: "2026-12-31T23:59:59.000Z" })
	datedTo!: Date;

	@ApiProperty({ enum: GenericStatus, example: GenericStatus.active })
	status!: GenericStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
