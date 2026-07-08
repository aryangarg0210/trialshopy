import { ApiProperty } from "@nestjs/swagger";
import { StoreVerification } from "@repo/db";
import { IsEnum } from "class-validator";

export class UpdateVerificationDto {
	@ApiProperty({ enum: StoreVerification, example: StoreVerification.verified })
	@IsEnum(StoreVerification)
	verification!: StoreVerification;
}
