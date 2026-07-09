import { ApiPropertyOptional } from "@nestjs/swagger";
import { DeliveryStatus, FulfilmentStage, SubOrderStatus } from "@repo/db";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateSubOrderDto {
	@ApiPropertyOptional({ enum: SubOrderStatus })
	@IsOptional()
	@IsEnum(SubOrderStatus)
	status?: SubOrderStatus;

	@ApiPropertyOptional({ enum: DeliveryStatus })
	@IsOptional()
	@IsEnum(DeliveryStatus)
	deliveryStatus?: DeliveryStatus;

	@ApiPropertyOptional({
		enum: FulfilmentStage,
		description: "Appends a timestamped entry to the fulfilment history",
	})
	@IsOptional()
	@IsEnum(FulfilmentStage)
	stage?: FulfilmentStage;

	@ApiPropertyOptional({ example: "Delhivery" })
	@IsOptional()
	@IsString()
	deliveryPartner?: string;

	@ApiPropertyOptional({ example: 40, minimum: 0 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	deliveryPrice?: number;
}
