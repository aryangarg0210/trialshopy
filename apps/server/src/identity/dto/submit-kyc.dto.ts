import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsOptional,
	IsString,
	IsUrl,
	ValidateNested,
} from "class-validator";

class KycDocumentDto {
	@ApiProperty({ example: "pan_card" })
	@IsString()
	name!: string;

	@ApiProperty({ example: "https://cdn.trialshopy.com/kyc/pan.jpg" })
	@IsUrl()
	url!: string;
}

export class SubmitKycDto {
	@ApiPropertyOptional({ example: "Asha Rao" })
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiPropertyOptional({ example: "123456789012" })
	@IsOptional()
	@IsString()
	aadharNumber?: string;

	@ApiPropertyOptional({ example: "ABCDE1234F" })
	@IsOptional()
	@IsString()
	panNumber?: string;

	@ApiPropertyOptional({ example: "29ABCDE1234F1Z5" })
	@IsOptional()
	@IsString()
	gstin?: string;

	@ApiPropertyOptional({ example: "HDFC0001234" })
	@IsOptional()
	@IsString()
	ifscCode?: string;

	@ApiPropertyOptional({ example: "50100123456789" })
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
