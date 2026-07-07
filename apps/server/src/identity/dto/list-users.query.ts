import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";

export class ListUsersQuery {
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

	@ApiPropertyOptional({ enum: UserRole, example: UserRole.seller })
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@ApiPropertyOptional({ description: "Filter by ban state", example: false })
	@IsOptional()
	@Transform(({ value }) => value === "true" || value === true)
	@IsBoolean()
	banned?: boolean;

	@ApiPropertyOptional({
		description: "Search by name, email, or phone number",
		example: "asha",
	})
	@IsOptional()
	@IsString()
	search?: string;
}
