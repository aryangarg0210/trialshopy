import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsDateString,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateMeetRequestDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	@IsMongoId()
	storeId!: string;

	@ApiProperty({ example: "Want a live walkthrough of the new sneakers" })
	@IsString()
	@IsNotEmpty()
	purpose!: string;

	@ApiProperty({ example: "2026-07-20T00:00:00.000Z" })
	@IsDateString()
	date!: string;

	@ApiProperty({ example: "15:30" })
	@IsString()
	@IsNotEmpty()
	time!: string;

	@ApiPropertyOptional({ type: [String], example: [] })
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	productIds?: string[];
}
