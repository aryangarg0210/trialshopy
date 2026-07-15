import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class SendMessageDto {
	@ApiPropertyOptional({
		example: "Hi, is this still available?",
		maxLength: 2000,
	})
	@IsOptional()
	@IsString()
	@MaxLength(2000)
	text?: string;

	@ApiPropertyOptional({ example: "https://cdn.trialshopy.com/m/img.jpg" })
	@IsOptional()
	@IsUrl()
	imageUrl?: string;

	@ApiPropertyOptional({ example: "https://cdn.trialshopy.com/m/clip.mp4" })
	@IsOptional()
	@IsUrl()
	videoUrl?: string;
}
