import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsOptional,
	IsString,
	IsUrl,
	MaxLength,
	MinLength,
} from "class-validator";

export class UpdateUserDto {
	@ApiPropertyOptional({ example: "Asha Rao" })
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(120)
	name?: string;

	@ApiPropertyOptional({ example: "https://cdn.trialshopy.com/u/asha.jpg" })
	@IsOptional()
	@IsUrl()
	image?: string;
}
