import { ApiProperty } from "@nestjs/swagger";

export class FaqResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "How do I track my order?" })
	question!: string;

	@ApiProperty({
		example: "Go to My Orders and tap the order to see live status.",
	})
	answer!: string;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}
