import { ApiProperty } from "@nestjs/swagger";

export class OfferResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6260" })
	storeId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6268" })
	brandId!: string | null;

	@ApiProperty({ example: "Monsoon Sale" })
	title!: string;

	@ApiProperty({ nullable: true, example: "Flat 20% off select items" })
	description!: string | null;

	@ApiProperty({ example: 20 })
	discount!: number;

	@ApiProperty({ type: [String], example: [] })
	applicableProductIds!: string[];

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	validFrom!: Date;

	@ApiProperty({ example: "2026-07-31T23:59:59.000Z" })
	validUntil!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
