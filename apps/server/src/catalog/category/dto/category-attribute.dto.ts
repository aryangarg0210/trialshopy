import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CategoryAttributeDto {
	@ApiProperty({ example: "Size" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: "select", description: "e.g. select, text" })
	@IsString()
	@IsNotEmpty()
	type!: string;

	@ApiPropertyOptional({ type: [String], example: ["S", "M", "L"] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	options: string[] = [];
}
