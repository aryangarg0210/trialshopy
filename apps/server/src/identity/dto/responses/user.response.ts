import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@repo/db";

export class UserResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6264" })
	id!: string;

	@ApiProperty({ example: "Asha Rao" })
	name!: string;

	@ApiProperty({ example: "asha@example.com" })
	email!: string;

	@ApiProperty({ example: false })
	emailVerified!: boolean;

	@ApiProperty({
		nullable: true,
		example: "https://cdn.trialshopy.com/u/asha.jpg",
	})
	image!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	phoneNumber!: string | null;

	@ApiProperty({ example: true })
	phoneNumberVerified!: boolean;

	@ApiProperty({ enum: UserRole, example: UserRole.customer })
	role!: UserRole;

	@ApiProperty({ example: false })
	banned!: boolean;

	@ApiProperty({ nullable: true, example: null })
	banReason!: string | null;

	@ApiProperty({ nullable: true, example: null, type: String })
	banExpires!: Date | null;

	@ApiProperty({ example: "2026-07-07T19:40:53.508Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-07T19:40:53.508Z" })
	updatedAt!: Date;
}
