import { ApiProperty } from "@nestjs/swagger";
import {
	ArrayNotEmpty,
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsString,
} from "class-validator";

export class CreateHeaderDto {
	@ApiProperty({ example: "Trending in Sneakers" })
	@IsString()
	@IsNotEmpty()
	title!: string;

	@ApiProperty({ type: [String], example: ["6a4d564507ba0a597bdc6276"] })
	@IsArray()
	@ArrayNotEmpty()
	@IsMongoId({ each: true })
	productIds!: string[];

	@ApiProperty({ example: "6a4d564507ba0a597bdc6268" })
	@IsMongoId()
	subcategoryId!: string;
}
