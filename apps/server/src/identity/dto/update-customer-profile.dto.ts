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
	@ApiPropertyOptional({ example: "HDFC Bank" })
	@IsOptional()
	@IsString()
	bankName?: string;

	@ApiPropertyOptional({ example: "MG Road, Bengaluru" })
	@IsOptional()
	@IsString()
	bankAddress?: string;

	@ApiPropertyOptional({ example: "50100123456789" })
	@IsOptional()
	@IsString()
	accountNumber?: string;

	@ApiPropertyOptional({ example: "HDFC0001234" })
	@IsOptional()
	@IsString()
	ifscCode?: string;

	@ApiPropertyOptional({ example: "asha@hdfcbank" })
	@IsOptional()
	@IsString()
	custId?: string;

	@ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.upi })
	@IsOptional()
	@IsEnum(PaymentMethod)
	method?: PaymentMethod;
}

export class UpdateCustomerProfileDto {
	@ApiPropertyOptional({ enum: Gender, example: Gender.female })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiPropertyOptional({
		description: "ISO date string",
		example: "1995-06-01",
	})
	@IsOptional()
	@IsString()
	dateOfBirth?: string;

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

	@ApiPropertyOptional({ type: PaymentDetailsDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => PaymentDetailsDto)
	paymentDetails?: PaymentDetailsDto;

	@ApiPropertyOptional({ example: false })
	@IsOptional()
	@IsBoolean()
	thirdParty?: boolean;
}
