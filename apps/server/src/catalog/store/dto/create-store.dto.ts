import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CatalogStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { MediaDto } from "../../dto/media.dto";
import { GeoPointDto } from "./geo-point.dto";
import { OpeningHourDto } from "./opening-hour.dto";

export class CreateStoreDto {
	@ApiProperty({ example: "Asha Electronics" })
	@IsString()
	@IsNotEmpty()
	storeName!: string;

	@ApiPropertyOptional({ example: "Your neighbourhood gadget shop" })
	@IsOptional()
	@IsString()
	storeDescription?: string;

	@ApiPropertyOptional({ example: "29ABCDE1234F1Z5" })
	@IsOptional()
	@IsString()
	gstId?: string;

	@ApiPropertyOptional({ type: [MediaDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MediaDto)
	images?: MediaDto[];

	@ApiPropertyOptional({
		type: [String],
		example: ["6a4d564507ba0a597bdc6276"],
	})
	@IsOptional()
	@IsArray()
	@IsMongoId({ each: true })
	categoryIds?: string[];

	@ApiPropertyOptional({ type: [OpeningHourDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OpeningHourDto)
	openingHours?: OpeningHourDto[];

	@ApiPropertyOptional({ type: GeoPointDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => GeoPointDto)
	location?: GeoPointDto;

	@ApiPropertyOptional({ example: "12 MG Road" })
	@IsOptional()
	@IsString()
	addressLine?: string;

	@ApiPropertyOptional({ example: "Bengaluru" })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ example: "560001" })
	@IsOptional()
	@IsString()
	pincode?: string;

	@ApiPropertyOptional({ example: "Near Trinity Metro" })
	@IsOptional()
	@IsString()
	landmark?: string;

	@ApiPropertyOptional({ example: "Karnataka" })
	@IsOptional()
	@IsString()
	state?: string;

	@ApiPropertyOptional({ example: "India", default: "India" })
	@IsOptional()
	@IsString()
	country?: string;

	@ApiPropertyOptional({ enum: CatalogStatus, default: CatalogStatus.active })
	@IsOptional()
	@IsEnum(CatalogStatus)
	status?: CatalogStatus;
}
