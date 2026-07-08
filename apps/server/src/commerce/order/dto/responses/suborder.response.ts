import { ApiProperty } from "@nestjs/swagger";
import { DeliveryStatus, FulfilmentStage, SubOrderStatus } from "@repo/db";

class StatusUpdateResponseDto {
	@ApiProperty({ enum: FulfilmentStage, example: FulfilmentStage.placed })
	stage!: FulfilmentStage;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	timestamp!: Date;
}

export class SubOrderResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6270" })
	orderId!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6271" })
	productId!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6272" })
	variantId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6260" })
	storeId!: string | null;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6264" })
	sellerId!: string | null;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6250" })
	customerId!: string;

	@ApiProperty({ nullable: true, example: "M" })
	size!: string | null;

	@ApiProperty({ example: 2 })
	quantity!: number;

	@ApiProperty({ nullable: true, example: 34990 })
	mrp!: number | null;

	@ApiProperty({ nullable: true, example: 26991 })
	finalPrice!: number | null;

	@ApiProperty({ enum: SubOrderStatus, example: SubOrderStatus.pending })
	status!: SubOrderStatus;

	@ApiProperty({ enum: DeliveryStatus, nullable: true })
	deliveryStatus!: DeliveryStatus | null;

	@ApiProperty({ type: [StatusUpdateResponseDto] })
	statusUpdates!: StatusUpdateResponseDto[];

	@ApiProperty({ nullable: true, example: "Delhivery" })
	deliveryPartner!: string | null;

	@ApiProperty({ nullable: true, example: 40 })
	deliveryPrice!: number | null;

	@ApiProperty({ nullable: true, example: 27031 })
	totalAfterDelivery!: number | null;

	@ApiProperty({ nullable: true, example: "2026-07-16T10:00:00.000Z" })
	returnLastDate!: Date | null;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
