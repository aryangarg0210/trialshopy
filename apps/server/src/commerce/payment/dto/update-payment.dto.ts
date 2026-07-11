import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { GenericStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { CreatePaymentDto } from "./create-payment.dto";

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
	@ApiPropertyOptional({ enum: GenericStatus })
	@IsOptional()
	@IsEnum(GenericStatus)
	status?: GenericStatus;
}
