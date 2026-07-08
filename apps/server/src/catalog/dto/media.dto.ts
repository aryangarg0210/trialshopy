import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class MediaDto {
	@ApiProperty({ example: "https://cdn.trialshopy.com/c/electronics.jpg" })
	@IsUrl()
	url!: string;

	@ApiPropertyOptional({ example: "c/electronics" })
	@IsOptional()
	@IsString()
	publicId?: string;
}
