import { ApiProperty } from "@nestjs/swagger";

export class SponsoredProductResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	productId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	categoryId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	subcategoryId!: string;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}
