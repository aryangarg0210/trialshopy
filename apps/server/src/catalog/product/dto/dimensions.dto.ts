import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DimensionsDto {
	@ApiPropertyOptional({ example: "500g" })
	@IsOptional()
	@IsString()
	weight?: string;

	@ApiPropertyOptional({ example: "10cm" })
	@IsOptional()
	@IsString()
	height?: string;

	@ApiPropertyOptional({ example: "20cm" })
	@IsOptional()
	@IsString()
	length?: string;

	@ApiPropertyOptional({ example: "15cm" })
	@IsOptional()
	@IsString()
	width?: string;

	@ApiPropertyOptional({ example: "Fragile" })
	@IsOptional()
	@IsString()
	other?: string;
}
