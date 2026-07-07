import { ApiPropertyOptional } from "@nestjs/swagger";
import { Gender, PaymentMethod } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "./media.dto";

class PaymentDetailsDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	bankName?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	bankAddress?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	accountNumber?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	ifscCode?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	custId?: string;

	@ApiPropertyOptional({ enum: PaymentMethod })
	@IsOptional()
	@IsEnum(PaymentMethod)
	method?: PaymentMethod;
}

export class UpdateCustomerProfileDto {
	@ApiPropertyOptional({ enum: Gender })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiPropertyOptional({ description: "ISO date string" })
	@IsOptional()
	@IsString()
	dateOfBirth?: string;

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

	@ApiPropertyOptional({ type: PaymentDetailsDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => PaymentDetailsDto)
	paymentDetails?: PaymentDetailsDto;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	thirdParty?: boolean;
}
