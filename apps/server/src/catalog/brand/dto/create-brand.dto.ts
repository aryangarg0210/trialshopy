import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "../../dto/media.dto";

export class CreateBrandDto {
	@ApiProperty({ example: "Sony" })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({ example: "Consumer electronics manufacturer" })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ type: MediaDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => MediaDto)
	logo?: MediaDto;

	@ApiPropertyOptional({ type: MediaDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => MediaDto)
	video?: MediaDto;

	@ApiPropertyOptional({
		type: [String],
		description: "Category ids this brand belongs to",
		example: ["6a4d564507ba0a597bdc6276"],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	categoryIds?: string[];

	@ApiPropertyOptional({ default: false })
	@IsOptional()
	@IsBoolean()
	isPopular?: boolean;

	@ApiPropertyOptional({ enum: CatalogStatus, default: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;
}
