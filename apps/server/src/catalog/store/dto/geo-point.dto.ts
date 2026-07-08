import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class GeoPointDto {
	@ApiPropertyOptional({ example: "Point", default: "Point" })
	@IsOptional()
	@IsString()
	@IsIn(["Point"])
	type?: string;

	@ApiProperty({
		type: [Number],
		description: "[longitude, latitude]",
		example: [77.5946, 12.9716],
	})
	@IsArray()
	@ArrayMinSize(2)
	@ArrayMaxSize(2)
	@IsNumber({}, { each: true })
	coordinates!: number[];
}
