import { ApiProperty } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class ModerateReviewDto {
	@ApiProperty({ enum: GenericStatus })
	@IsEnum(GenericStatus)
	status!: GenericStatus;
}
