import { ApiPropertyOptional } from "@nestjs/swagger";
import { AddressOwnerType, GenericStatus } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsEnum,
	IsInt,
	IsMongoId,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class ListAddressesQuery {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit = 20;

	@ApiPropertyOptional({
		enum: AddressOwnerType,
		example: AddressOwnerType.user,
	})
	@IsOptional()
	@IsEnum(AddressOwnerType)
	ownerType?: AddressOwnerType;

	@ApiPropertyOptional({ description: "Filter by owner id" })
	@IsOptional()
	@IsMongoId()
	ownerId?: string;

	@ApiPropertyOptional({ example: "Bengaluru" })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({ enum: GenericStatus, example: GenericStatus.active })
	@IsOptional()
	@IsEnum(GenericStatus)
	status?: GenericStatus;
}
