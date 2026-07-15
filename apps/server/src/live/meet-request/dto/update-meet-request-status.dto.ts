import { ApiProperty } from "@nestjs/swagger";
import { MeetRequestStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class UpdateMeetRequestStatusDto {
	@ApiProperty({
		enum: MeetRequestStatus,
		example: MeetRequestStatus.confirmed,
	})
	@IsEnum(MeetRequestStatus)
	status!: MeetRequestStatus;
}
