import { ApiProperty } from "@nestjs/swagger";
import { OrderStatus } from "@repo/db";
import { SubOrderResponseDto } from "./suborder.response";

class ShippingSnapshotResponseDto {
	@ApiProperty({ nullable: true, example: "Asha Rao" })
	fullName!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	phoneNumber!: string | null;

	@ApiProperty({ nullable: true, example: "+919876543211" })
	alternatePhone!: string | null;

	@ApiProperty({ nullable: true, example: "12 MG Road" })
	addressLine!: string | null;

	@ApiProperty({ example: "Bengaluru" })
	city!: string;

	@ApiProperty({ example: "560001" })
	pincode!: string;

	@ApiProperty({ nullable: true, example: "Near Trinity Metro" })
	landmark!: string | null;

	@ApiProperty({ example: "Karnataka" })
	state!: string;

	@ApiProperty({ example: "India" })
	country!: string;
}

export class OrderResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6270" })
	id!: string;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6250" })
	customerId!: string;

	@ApiProperty({ example: 26991 })
	totalPrice!: number;

	@ApiProperty({ nullable: true, example: "+919876543210" })
	phoneNumber!: string | null;

	@ApiProperty({ type: ShippingSnapshotResponseDto })
	shippingAddress!: ShippingSnapshotResponseDto;

	@ApiProperty({ enum: OrderStatus, example: OrderStatus.pending })
	status!: OrderStatus;

	@ApiProperty({ example: false })
	rateProduct!: boolean;

	@ApiProperty({ type: [SubOrderResponseDto] })
	subOrders!: SubOrderResponseDto[];

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-09T10:00:00.000Z" })
	updatedAt!: Date;
}
