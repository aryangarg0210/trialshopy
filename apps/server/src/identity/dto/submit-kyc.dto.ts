import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsOptional,
	IsString,
	IsUrl,
	ValidateNested,
} from "class-validator";

class KycDocumentDto {
	@IsString()
	name!: string;

	@IsUrl()
	url!: string;
}

export class SubmitKycDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	aadharNumber?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	panNumber?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	gstin?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	ifscCode?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	accountNumber?: string;

	@ApiPropertyOptional({ type: [KycDocumentDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => KycDocumentDto)
	documents?: KycDocumentDto[];
}
