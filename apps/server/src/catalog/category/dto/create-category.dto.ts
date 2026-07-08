import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
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
import { CategoryAttributeDto } from "./category-attribute.dto";

export class CreateCategoryDto {
	@ApiProperty({ example: "Electronics" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({ example: "Phones, laptops and accessories" })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description: "Parent category id (omit for a root category)",
		example: "6a4d564507ba0a597bdc6276",
	})
	@IsOptional()
	@IsMongoId()
	parentId?: string;

	@ApiPropertyOptional({ type: MediaDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => MediaDto)
	image?: MediaDto;

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	featured?: boolean;

	@ApiPropertyOptional({ default: 0, minimum: 0, maximum: 100 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	discount?: number;

	@ApiPropertyOptional({ enum: CatalogStatus, default: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;

	@ApiPropertyOptional({ type: [CategoryAttributeDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CategoryAttributeDto)
	attributes?: CategoryAttributeDto[];
}
