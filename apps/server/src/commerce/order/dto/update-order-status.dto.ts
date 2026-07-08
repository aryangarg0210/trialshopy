import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@repo/db";
import { IsEnum } from "class-validator";

export class UpdateOrderStatusDto {
	@ApiProperty({ enum: OrderStatus, example: OrderStatus.processing })
	@IsEnum(OrderStatus)
	status!: OrderStatus;
}
