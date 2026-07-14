import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "../../../catalog/dto/media.dto";

export class CreateReviewDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	@IsMongoId()
	productId!: string;

	@ApiProperty({ example: "Great quality, fits perfectly." })
	@IsString()
	@IsNotEmpty()
	reviewText!: string;

	@ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
	@IsNumber()
	@Min(1)
	@Max(5)
	rating!: number;

	@ApiPropertyOptional({ type: [MediaDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MediaDto)
	pictures?: MediaDto[];
}
