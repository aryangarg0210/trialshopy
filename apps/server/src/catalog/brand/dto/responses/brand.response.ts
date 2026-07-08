import { ApiProperty } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { MediaDto } from "../../../dto/media.dto";

export class BrandResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "Sony" })
	name!: string;

	@ApiProperty({ nullable: true, example: "Consumer electronics manufacturer" })
	description!: string | null;

	@ApiProperty({ type: MediaDto, nullable: true })
	logo!: MediaDto | null;

	@ApiProperty({ type: MediaDto, nullable: true })
	video!: MediaDto | null;

	@ApiProperty({ type: [String], example: ["6a4d564507ba0a597bdc6276"] })
	categoryIds!: string[];

	@ApiProperty({ example: false })
	isPopular!: boolean;

	@ApiProperty({ example: 0 })
	totalProductsSold!: number;

	@ApiProperty({ enum: CatalogStatus, example: CatalogStatus.active })
	status!: CatalogStatus;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-08T10:00:00.000Z" })
	updatedAt!: Date;
}
