import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * HTTP response returned immediately after POST /api/tryon/generate.
 *
 * The client uses `sessionId` to:
 *  1. Join the Socket.io room: emit `tryon:join_session` with { sessionId }
 *  2. Receive live events: tryon:queued → tryon:running → tryon:completed / tryon:failed
 *  3. Or poll GET /api/tryon/sessions/:id for a stateless fallback.
 */
export class TryOnSessionResponseDto {
	@ApiProperty({
		description: "Unique MongoDB ObjectId of the created try-on session.",
	})
	sessionId: string;

	@ApiProperty({
		description: "Current processing status.",
		enum: ["queued", "running", "completed", "failed"],
	})
	status: string;

	@ApiPropertyOptional({
		description:
			"Message explaining how to receive live updates over Socket.io.",
	})
	message: string;
}

/**
 * Full session detail returned by GET /api/tryon/sessions/:id
 */
export class TryOnSessionDetailDto {
	@ApiProperty() id: string;
	@ApiPropertyOptional() userId?: string;
	@ApiPropertyOptional() productId?: string;
	@ApiProperty() personImageUrl: string;
	@ApiProperty() garmentImageUrl: string;
	@ApiProperty({ enum: ["queued", "running", "completed", "failed"] })
	status: string;
	@ApiPropertyOptional() resultUrl?: string;
	@ApiPropertyOptional() errorMessage?: string;
	@ApiProperty() clothType: string;
	@ApiProperty() createdAt: Date;
	@ApiProperty() updatedAt: Date;
}
