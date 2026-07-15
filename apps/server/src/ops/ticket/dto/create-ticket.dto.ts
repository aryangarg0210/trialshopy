import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
} from "class-validator";

export class CreateTicketDto {
	@ApiProperty({ example: "Payout not received" })
	@IsString()
	@IsNotEmpty()
	issueRegarding!: string;

	@ApiProperty({ example: "My settlement for last week is still pending." })
	@IsString()
	@IsNotEmpty()
	problemStatement!: string;

	@ApiPropertyOptional({ example: "+919876543210" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiPropertyOptional({ type: [String], example: [] })
	@IsOptional()
	@IsArray()
	@IsUrl({}, { each: true })
	images?: string[];
}
