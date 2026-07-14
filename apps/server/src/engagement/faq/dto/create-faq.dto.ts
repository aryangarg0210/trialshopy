import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFaqDto {
	@ApiProperty({ example: "How do I track my order?" })
	@IsString()
	@IsNotEmpty()
	question!: string;

	@ApiProperty({
		example: "Go to My Orders and tap the order to see live status.",
	})
	@IsString()
	@IsNotEmpty()
	answer!: string;
}
