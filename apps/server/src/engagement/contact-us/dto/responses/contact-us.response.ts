import { ApiProperty } from "@nestjs/swagger";

export class ContactUsResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "Ava" })
	firstName!: string;

	@ApiProperty({ example: "Sharma" })
	lastName!: string;

	@ApiProperty({ example: "ava@example.com" })
	email!: string;

	@ApiProperty({ example: "+919876543210" })
	phone!: string;

	@ApiProperty({ example: "I have a question about my recent order." })
	message!: string;

	@ApiProperty({ type: [String], example: [] })
	attachments!: string[];

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}
