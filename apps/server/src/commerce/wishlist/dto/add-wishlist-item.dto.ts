import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class AddWishlistItemDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	@IsMongoId()
	productId!: string;
}
