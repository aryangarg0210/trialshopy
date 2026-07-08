import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class KeyValueDto {
	@ApiProperty({ example: "Warranty" })
	@IsString()
	title!: string;

	@ApiProperty({ example: "1 year manufacturer warranty" })
	@IsString()
	value!: string;
}
