import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInt,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "../../dto/media.dto";
import { ComplianceDto } from "./compliance.dto";
import { CreateVariantDto } from "./create-variant.dto";
import { DimensionsDto } from "./dimensions.dto";
import { KeyValueDto } from "./key-value.dto";
import { SeoDto } from "./seo.dto";

export class CreateProductDto {
	@ApiProperty({ example: "Sony WH-1000XM5 Wireless Headphones" })
	@IsString()
	@IsNotEmpty()
	productName!: string;

	@ApiPropertyOptional({ example: "Industry-leading noise cancellation" })
	@IsOptional()
	@IsString()
	shortDescription?: string;

	@ApiPropertyOptional({ example: "Full product description here..." })
	@IsOptional()
	@IsString()
	fullDescription?: string;

	@ApiPropertyOptional({ description: "Brand id" })
	@IsOptional()
	@IsMongoId()
	brandId?: string;

	@ApiPropertyOptional({ description: "Primary category id" })
	@IsOptional()
	@IsMongoId()
	categoryId?: string;

	@ApiPropertyOptional({
		type: [String],
		description: "Additional category ids",
		example: ["6a4d564507ba0a597bdc6276"],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	categoryIds?: string[];

	@ApiPropertyOptional({ type: [String], example: ["audio", "wireless"] })
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];

	@ApiPropertyOptional({ type: [MediaDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MediaDto)
	media?: MediaDto[];

	@ApiProperty({ example: 29990 })
	@IsNumber()
	@Min(0)
	basePrice!: number;

	@ApiPropertyOptional({ example: 34990 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	mrp?: number;

	@ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discount?: number;

	@ApiPropertyOptional({ default: true })
	@IsOptional()
	@IsBoolean()
	isDiscount?: boolean;

	@ApiPropertyOptional({ default: true })
	@IsOptional()
	@IsBoolean()
	inStock?: boolean;

	@ApiPropertyOptional({ example: 100, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	stock?: number;

	@ApiPropertyOptional({ example: 1, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	orderMinQuantity?: number;

	@ApiPropertyOptional({ example: 10, minimum: 0 })
	@IsOptional()
	@IsInt()
	@Min(0)
	orderMaxQuantity?: number;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	forRent?: boolean;

	@ApiPropertyOptional({ example: 0, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	rentPerHour?: number;

	@ApiPropertyOptional({ example: "Sony India" })
	@IsOptional()
	@IsString()
	manufacturer?: string;

	@ApiPropertyOptional({ example: "Sony Corporation" })
	@IsOptional()
	@IsString()
	manufacturerDrop?: string;

	@ApiPropertyOptional({ example: "Japan" })
	@IsOptional()
	@IsString()
	countryOfOrigin?: string;

	@ApiPropertyOptional({ example: "Plastic, leather" })
	@IsOptional()
	@IsString()
	material?: string;

	@ApiPropertyOptional({ example: "Black" })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ example: "85183000" })
	@IsOptional()
	@IsString()
	hsnCode?: string;

	@ApiPropertyOptional({ type: ComplianceDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => ComplianceDto)
	compliance?: ComplianceDto;

	@ApiPropertyOptional({ example: "Penguin Books" })
	@IsOptional()
	@IsString()
	publisher?: string;

	@ApiPropertyOptional({ example: "English" })
	@IsOptional()
	@IsString()
	language?: string;

	@ApiPropertyOptional({
		type: [String],
		example: ["Noise cancelling", "30h battery"],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	features?: string[];

	@ApiPropertyOptional({ type: [KeyValueDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => KeyValueDto)
	attributes?: KeyValueDto[];

	@ApiPropertyOptional({ type: [KeyValueDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => KeyValueDto)
	specifications?: KeyValueDto[];

	@ApiPropertyOptional({ type: DimensionsDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => DimensionsDto)
	dimensions?: DimensionsDto;

	@ApiPropertyOptional({ type: SeoDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => SeoDto)
	seo?: SeoDto;

	@ApiPropertyOptional({ example: 0, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	shippingCharge?: number;

	@ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
	@IsOptional()
	@IsDateString()
	manufactureDate?: string;

	@ApiPropertyOptional({ example: "2028-01-01T00:00:00.000Z" })
	@IsOptional()
	@IsDateString()
	expireDate?: string;

	@ApiPropertyOptional({ example: "2026-07-01T00:00:00.000Z" })
	@IsOptional()
	@IsDateString()
	availableFrom?: string;

	@ApiPropertyOptional({ example: "2026-12-31T00:00:00.000Z" })
	@IsOptional()
	@IsDateString()
	availableTo?: string;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	showOnHome?: boolean;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	markNew?: boolean;

	@ApiPropertyOptional({ default: true })
	@IsOptional()
	@IsBoolean()
	reviewAllowed?: boolean;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	isNewWeekly?: boolean;

	@ApiPropertyOptional({
		type: [String],
		description: "Related product ids",
		example: [],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	relatedProductIds?: string[];

	@ApiPropertyOptional({ enum: CatalogStatus, default: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;

	@ApiPropertyOptional({
		type: [CreateVariantDto],
		description: "Optional variants created together with the product",
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateVariantDto)
	variants?: CreateVariantDto[];
}
