import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ComplianceDto {
	@ApiPropertyOptional({ example: "29ABCDE1234F1Z5" })
	@IsOptional()
	@IsString()
	gstNumber?: string;

	@ApiPropertyOptional({ example: "29ABCDE1234F1Z5" })
	@IsOptional()
	@IsString()
	sgstNumber?: string;

	@ApiPropertyOptional({ example: "IS 13252" })
	@IsOptional()
	@IsString()
	isNumber?: string;

	@ApiPropertyOptional({ example: "CM/L-1234567" })
	@IsOptional()
	@IsString()
	cmlNumber?: string;
}
