import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "./media.dto";

export class UpdateSellerProfileDto {
	@ApiPropertyOptional({ example: "Asha" })
	@IsOptional()
	@IsString()
	@MaxLength(80)
	firstName?: string;

	@ApiPropertyOptional({ example: "Kumari" })
	@IsOptional()
	@IsString()
	@MaxLength(80)
	middleName?: string;

	@ApiPropertyOptional({ example: "Rao" })
	@IsOptional()
	@IsString()
	@MaxLength(80)
	lastName?: string;

	@ApiPropertyOptional({ example: "+919876543210" })
	@IsOptional()
	@IsString()
	alternatePhoneNumber?: string;

	@ApiPropertyOptional({ type: MediaDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => MediaDto)
	profilePic?: MediaDto;

	@ApiPropertyOptional({ type: [String], example: ["en", "hi"] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	languages?: string[];
}
