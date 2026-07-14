import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
} from "class-validator";

export class CreateContactUsDto {
	@ApiProperty({ example: "Ava" })
	@IsString()
	@IsNotEmpty()
	firstName!: string;

	@ApiProperty({ example: "Sharma" })
	@IsString()
	@IsNotEmpty()
	lastName!: string;

	@ApiProperty({ example: "ava@example.com" })
	@IsEmail()
	email!: string;

	@ApiProperty({ example: "+919876543210" })
	@IsString()
	@IsNotEmpty()
	phone!: string;

	@ApiProperty({ example: "I have a question about my recent order." })
	@IsString()
	@IsNotEmpty()
	message!: string;

	@ApiPropertyOptional({ type: [String], example: [] })
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true })
	attachments?: string[];
}
