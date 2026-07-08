import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsMongoId, IsOptional, IsString, Min } from "class-validator";

export class AddCartItemDto {
	@ApiProperty({ description: "Product id" })
	@IsMongoId()
	productId!: string;

	@ApiPropertyOptional({
		description: "Variant id, if the product has variants",
	})
	@IsOptional()
	@IsMongoId()
	variantId?: string;

	@ApiPropertyOptional({ example: "M" })
	@IsOptional()
	@IsString()
	size?: string;

	@ApiProperty({ example: 1, minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	quantity = 1;
}
