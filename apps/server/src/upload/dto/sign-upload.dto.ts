import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class SignUploadDto {
	@ApiPropertyOptional({
		description: "Target folder in the media store (letters, digits, / _ -)",
		example: "products",
		default: "trialshopy",
	})
	@IsOptional()
	@IsString()
	@Matches(/^[a-zA-Z0-9/_-]+$/, {
		message: "folder may only contain letters, digits, and / _ -",
	})
	folder?: string;
}
