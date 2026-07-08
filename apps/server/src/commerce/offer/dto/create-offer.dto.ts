import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsArray,
	IsDateString,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class CreateOfferDto {
	@ApiProperty({ example: "Monsoon Sale" })
	@IsString()
	@IsNotEmpty()
	title!: string;

	@ApiPropertyOptional({ example: "Flat 20% off select items" })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ example: 20, minimum: 0, maximum: 100 })
	@IsNumber()
	@Min(0)
	@Max(100)
	discount!: number;

	@ApiPropertyOptional({
		type: [String],
		description: "Products the offer applies to (defaults to the whole store)",
		example: [],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	applicableProductIds?: string[];

	@ApiProperty({ example: "2026-07-01T00:00:00.000Z" })
	@IsDateString()
	validFrom!: string;

	@ApiProperty({ example: "2026-07-31T23:59:59.000Z" })
	@IsDateString()
	validUntil!: string;
}
