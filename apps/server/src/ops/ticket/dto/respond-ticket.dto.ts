import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export const TICKET_STATUSES = [
	"open",
	"in_progress",
	"resolved",
	"cancelled",
] as const;

export class RespondTicketDto {
	@ApiPropertyOptional({
		example: "We have released your payout, please check.",
	})
	@IsOptional()
	@IsString()
	responseFromAdmin?: string;

	@ApiPropertyOptional({ example: true })
	@IsOptional()
	@IsBoolean()
	resolved?: boolean;

	@ApiPropertyOptional({ enum: TICKET_STATUSES })
	@IsOptional()
	@IsIn(TICKET_STATUSES)
	status?: (typeof TICKET_STATUSES)[number];
}
