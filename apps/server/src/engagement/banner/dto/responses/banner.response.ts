import { ApiProperty } from "@nestjs/swagger";

export class BannerResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({
		example: "https://cdn.trialshopy.com/banners/electronics.jpg",
	})
	url!: string;

	@ApiProperty({ example: "electronics" })
	category!: string;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}
