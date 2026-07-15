import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class CreateLiveChatDto {
	@ApiProperty({
		description: "The other participant's user id",
		example: "6a4d564507ba0a597bdc6260",
	})
	@IsMongoId()
	receiverId!: string;
}
