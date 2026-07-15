import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { MeetingStatus } from "@repo/db";
import { IsEnum, IsOptional } from "class-validator";
import { CreateMeetingDto } from "./create-meeting.dto";

export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {
	@ApiPropertyOptional({ enum: MeetingStatus })
	@IsOptional()
	@IsEnum(MeetingStatus)
	status?: MeetingStatus;
}
