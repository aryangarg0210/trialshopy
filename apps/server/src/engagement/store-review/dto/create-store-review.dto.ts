import { ApiProperty } from "@nestjs/swagger";
import {
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateStoreReviewDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	@IsMongoId()
	storeId!: string;

	@ApiProperty({ example: "Fast shipping and great support." })
	@IsString()
	@IsNotEmpty()
	reviewText!: string;

	@ApiProperty({ example: 5, minimum: 1, maximum: 5 })
	@IsNumber()
	@Min(1)
	@Max(5)
	rating!: number;
}
