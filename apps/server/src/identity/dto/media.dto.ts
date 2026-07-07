import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class MediaDto {
	@ApiProperty({ example: "https://cdn.trialshopy.com/u/asha.jpg" })
	@IsUrl()
	url!: string;

	@ApiPropertyOptional({ example: "u/asha" })
	@IsOptional()
	@IsString()
	publicId?: string;
}
