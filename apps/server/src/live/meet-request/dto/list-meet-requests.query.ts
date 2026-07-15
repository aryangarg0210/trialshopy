import { ApiPropertyOptional } from "@nestjs/swagger";
import { MeetRequestStatus } from "@repo/db";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";

export class ListMeetRequestsQuery {
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

	@ApiPropertyOptional({ enum: MeetRequestStatus })
	@IsOptional()
	@IsEnum(MeetRequestStatus)
	status?: MeetRequestStatus;
}
