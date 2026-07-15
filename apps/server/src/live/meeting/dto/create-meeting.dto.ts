import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsDateString,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateMeetingDto {
	@ApiProperty({ example: "Live sneaker walkthrough" })
	@IsString()
	@IsNotEmpty()
	title!: string;

	@ApiProperty({ example: "2026-07-20T00:00:00.000Z" })
	@IsDateString()
	date!: string;

	@ApiProperty({ example: "15:30" })
	@IsString()
	@IsNotEmpty()
	time!: string;

	@ApiProperty({ example: "98765432101" })
	@IsString()
	@IsNotEmpty()
	zoomMeetingId!: string;

	@ApiProperty({ example: "sneakers2026" })
	@IsString()
	@IsNotEmpty()
	zoomMeetingPassword!: string;

	@ApiPropertyOptional({
		type: [String],
		description: "Customer user ids invited to the meeting",
		example: [],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	userIds?: string[];

	@ApiPropertyOptional({ type: [String], example: [] })
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	productIds?: string[];
}
