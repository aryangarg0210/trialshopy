import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class OpeningHourDto {
	@ApiProperty({ example: "monday" })
	@IsString()
	dayOfWeek!: string;

	@ApiProperty({ example: "09:00" })
	@IsString()
	openTime!: string;

	@ApiProperty({ example: "21:00" })
	@IsString()
	closeTime!: string;
}
