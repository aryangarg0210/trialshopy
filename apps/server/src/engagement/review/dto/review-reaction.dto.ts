import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export type ReviewReaction = "like" | "dislike" | "none";

export class ReviewReactionDto {
	@ApiProperty({ enum: ["like", "dislike", "none"], example: "like" })
	@IsIn(["like", "dislike", "none"])
	reaction!: ReviewReaction;
}
