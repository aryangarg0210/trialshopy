import { ApiProperty } from "@nestjs/swagger";
import { NotificationStatus } from "@repo/db";

export class NotificationResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	userId!: string;

	@ApiProperty({ example: "Your order has been shipped." })
	message!: string;

	@ApiProperty({ enum: NotificationStatus })
	status!: NotificationStatus;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	sendAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}
