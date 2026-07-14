import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { MediaDto } from "../../../../catalog/dto/media.dto";

export class ReviewResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	userId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	productId!: string;

	@ApiProperty({ example: "Great quality, fits perfectly." })
	reviewText!: string;

	@ApiProperty({ example: 4.5 })
	rating!: number;

	@ApiProperty({ type: [MediaDto] })
	pictures!: MediaDto[];

	@ApiProperty({ type: [String], example: [] })
	likeIds!: string[];

	@ApiProperty({ type: [String], example: [] })
	dislikeIds!: string[];

	@ApiProperty({ enum: GenericStatus })
	status!: GenericStatus;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	updatedAt!: Date;
}
