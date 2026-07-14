import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";

export class StoreReviewResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	userId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	storeId!: string;

	@ApiProperty({ example: "Fast shipping and great support." })
	reviewText!: string;

	@ApiProperty({ example: 5 })
	rating!: number;

	@ApiProperty({ enum: GenericStatus })
	status!: GenericStatus;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	updatedAt!: Date;
}
