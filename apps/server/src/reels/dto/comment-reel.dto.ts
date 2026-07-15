import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CommentReelDto {
	@ApiProperty({ example: "Looks great!", maxLength: 500 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	comment!: string;
}
