import { ApiProperty } from "@nestjs/swagger";
import { ProfileStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class UpdateKycStatusDto {
	@ApiProperty({
		enum: ProfileStatus,
		description:
			"active = approved, inactive = rejected, pending = needs review",
		example: ProfileStatus.active,
	})
	@IsEnum(ProfileStatus)
	status!: ProfileStatus;
}
