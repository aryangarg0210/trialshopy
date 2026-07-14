import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateNotificationDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	@IsMongoId()
	userId!: string;

	@ApiProperty({ example: "Your order has been shipped." })
	@IsString()
	@IsNotEmpty()
	message!: string;

	@ApiPropertyOptional({ example: "2026-07-14T10:00:00.000Z" })
	@IsOptional()
	@IsDateString()
	sendAt?: string;
}
