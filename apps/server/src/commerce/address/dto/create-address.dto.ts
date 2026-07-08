import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AddressType } from "@repo/db";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAddressDto {
	@ApiPropertyOptional({ enum: AddressType, example: AddressType.home })
	@IsOptional()
	@IsEnum(AddressType)
	type?: AddressType;

	@ApiPropertyOptional({ example: "Asha Rao" })
	@IsOptional()
	@IsString()
	fullName?: string;

	@ApiPropertyOptional({ example: "+919876543210" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiPropertyOptional({ example: "+919876543211" })
	@IsOptional()
	@IsString()
	alternatePhone?: string;

	@ApiPropertyOptional({ example: "12 MG Road, Apt 4B" })
	@IsOptional()
	@IsString()
	addressLine?: string;

	@ApiProperty({ example: "Bengaluru" })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiProperty({ example: "560001" })
	@IsString()
	@IsNotEmpty()
	pincode!: string;

	@ApiPropertyOptional({ example: "Near Trinity Metro" })
	@IsOptional()
	@IsString()
	landmark?: string;

	@ApiProperty({ example: "Karnataka" })
	@IsString()
	@IsNotEmpty()
	state!: string;

	@ApiPropertyOptional({ example: "India", default: "India" })
	@IsOptional()
	@IsString()
	country?: string;
}
