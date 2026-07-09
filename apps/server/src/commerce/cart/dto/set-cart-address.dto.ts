import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class SetCartAddressDto {
	@ApiProperty({ description: "Id of one of the current user's addresses" })
	@IsMongoId()
	addressId!: string;
}
