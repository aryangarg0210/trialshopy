import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CommentReelDto {
	@ApiProperty({
		description: "The comment text",
		example: "Looks great!",
		maxLength: 500,
	})
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	comment!: string;
}
