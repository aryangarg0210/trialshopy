import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class ModerateStoreReviewDto {
	@ApiProperty({ enum: GenericStatus })
	@IsEnum(GenericStatus)
	status!: GenericStatus;
}
