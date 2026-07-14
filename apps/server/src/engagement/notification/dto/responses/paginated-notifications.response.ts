import { ApiProperty } from "@nestjs/swagger";
import { NotificationResponseDto } from "./notification.response";

export class PaginatedNotificationsResponseDto {
	@ApiProperty({ type: [NotificationResponseDto] })
	data!: NotificationResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
