import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReelDto {
	@ApiPropertyOptional({
		description: "Optional caption for the reel",
		maxLength: 500,
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	caption?: string;

	@ApiProperty({
		type: "string",
		format: "binary",
		description: "Video file (mp4, mov)",
	})
	video!: any; // Handled by Multer
}
