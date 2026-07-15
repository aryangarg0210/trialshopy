import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export type ReelReaction = "like" | "dislike" | "none";

export class ReelReactionDto {
	@ApiProperty({ enum: ["like", "dislike", "none"], example: "like" })
	@IsIn(["like", "dislike", "none"])
	reaction!: ReelReaction;
}
