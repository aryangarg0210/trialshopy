import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { CreateCommissionDto } from "./create-commission.dto";

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {
	@ApiPropertyOptional({ enum: GenericStatus })
	@IsOptional()
	@IsEnum(GenericStatus)
	status?: GenericStatus;
}
