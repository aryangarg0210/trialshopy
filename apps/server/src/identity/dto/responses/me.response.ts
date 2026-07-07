import { ApiProperty } from "@nestjs/swagger";
import { CustomerProfileResponseDto } from "./customer-profile.response";
import { SellerProfileResponseDto } from "./seller-profile.response";
import { UserResponseDto } from "./user.response";

export class MeResponseDto extends UserResponseDto {
	@ApiProperty({ type: CustomerProfileResponseDto, nullable: true })
	customerProfile!: CustomerProfileResponseDto | null;

	@ApiProperty({ type: SellerProfileResponseDto, nullable: true })
	sellerProfile!: SellerProfileResponseDto | null;
}
