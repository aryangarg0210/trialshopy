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
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(80)
	firstName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(80)
	middleName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@MaxLength(80)
	lastName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	alternatePhoneNumber?: string;

	@ApiPropertyOptional({ type: MediaDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => MediaDto)
	profilePic?: MediaDto;

	@ApiPropertyOptional({ type: [String] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	languages?: string[];
}
