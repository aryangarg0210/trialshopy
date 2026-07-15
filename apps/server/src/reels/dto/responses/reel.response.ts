import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReelAuthorType } from "@repo/db";

export class ReelCommentResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	userId!: string;

	@ApiProperty({ example: "Looks great!" })
	comment!: string;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;
}

export class ReelAuthorResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	id!: string;

	@ApiProperty({ example: "Ava Sharma" })
	name!: string;

	@ApiPropertyOptional({ example: "https://cdn.trialshopy.com/u/ava.jpg" })
	image?: string | null;
}

export class ReelResponseDto {
	@ApiProperty({ example: "6a4d564507ba0a597bdc6276" })
	id!: string;

	@ApiProperty({ enum: ReelAuthorType })
	authorType!: ReelAuthorType;

	@ApiProperty({ example: "6a4d564507ba0a597bdc6260" })
	authorId!: string;

	@ApiProperty({ nullable: true, example: "6a4d564507ba0a597bdc6268" })
	storeId!: string | null;

	@ApiProperty({
		example: "https://res.cloudinary.com/demo/video/upload/reel.mp4",
	})
	video!: string;

	@ApiProperty({ nullable: true, example: "New drop is live!" })
	caption!: string | null;

	@ApiProperty({ type: [String], example: [] })
	likeIds!: string[];

	@ApiProperty({ type: [String], example: [] })
	dislikeIds!: string[];

	@ApiProperty({ type: [ReelCommentResponseDto] })
	comments!: ReelCommentResponseDto[];

	@ApiProperty({ example: 0 })
	shares!: number;

	@ApiPropertyOptional({ type: ReelAuthorResponseDto, nullable: true })
	author?: ReelAuthorResponseDto | null;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	createdAt!: Date;

	@ApiProperty({ example: "2026-07-14T10:00:00.000Z" })
	updatedAt!: Date;
}
