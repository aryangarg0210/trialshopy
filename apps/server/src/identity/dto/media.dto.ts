import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class MediaDto {
	@IsUrl()
	url!: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	publicId?: string;
}
