import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "../../dto/media.dto";

export class CreateVariantDto {
	@ApiPropertyOptional({ example: "SONY-XM5-BLK" })
	@IsOptional()
	@IsString()
	sku?: string;

	@ApiPropertyOptional({ example: "SKU-001" })
	@IsOptional()
	@IsString()
	skuId?: string;

	@ApiPropertyOptional({ example: "Black" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "M" })
	@IsOptional()
	@IsString()
	size?: string;

	@ApiProperty({ example: 29990 })
	@IsNumber()
	@Min(0)
	price!: number;

	@ApiPropertyOptional({ example: 34990 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	mrp?: number;

	@ApiPropertyOptional({ example: 24990 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	trialshopyPrice?: number;

	@ApiPropertyOptional({ example: 19990 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	defectivePrice?: number;

	@ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discount?: number;

	@ApiPropertyOptional({ example: 50, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	stock?: number;

	@ApiPropertyOptional({ type: [MediaDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MediaDto)
	media?: MediaDto[];

	@ApiPropertyOptional({ enum: CatalogStatus, default: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;
}
