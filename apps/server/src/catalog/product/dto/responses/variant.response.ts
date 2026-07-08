import { ApiProperty } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { MediaDto } from "../../../dto/media.dto";

export class VariantResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6270" })
	productId!: string;

	@ApiProperty({ nullable: true, example: "SONY-XM5-BLK" })
	sku!: string | null;

	@ApiProperty({ nullable: true, example: "SKU-001" })
	skuId!: string | null;

	@ApiProperty({ nullable: true, example: "Black" })
	color!: string | null;

	@ApiProperty({ nullable: true, example: "M" })
	size!: string | null;

	@ApiProperty({ example: 29990 })
	price!: number;

	@ApiProperty({ nullable: true, example: 34990 })
	mrp!: number | null;

	@ApiProperty({ nullable: true, example: 24990 })
	trialshopyPrice!: number | null;

	@ApiProperty({ nullable: true, example: 19990 })
	defectivePrice!: number | null;

	@ApiProperty({ example: 10 })
	discount!: number;

	@ApiProperty({ example: 50 })
	stock!: number;

	@ApiProperty({ type: [MediaDto] })
	media!: MediaDto[];

	@ApiProperty({ enum: CatalogStatus, example: CatalogStatus.active })
	status!: CatalogStatus;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
