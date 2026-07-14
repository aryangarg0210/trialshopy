import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import {
	ApiAcceptedResponse,
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { GenerateTryOnDto } from "./dto/generate-tryon.dto";
import {
	TryOnSessionDetailDto,
	TryOnSessionResponseDto,
} from "./dto/tryon-session.response";
import { TryOnService } from "./tryon.service";

/**
 * TryOnController
 *
 * REST layer for the Virtual Try-On feature.
 *
 * Routes:
 *   POST /api/tryon/generate   — Submit a new try-on job (authenticated)
 *   GET  /api/tryon/sessions   — List current user's history  (authenticated)
 *   GET  /api/tryon/sessions/:id — Get a single session by ID  (authenticated)
 *
 * After POST /api/tryon/generate the client should connect over Socket.io
 * (namespace: /tryon) and emit `tryon:join_session` with the returned
 * sessionId to receive live progress events.
 */
@ApiTags("virtual-try-on")
@Controller("tryon")
export class TryOnController {
	constructor(private readonly tryOnService: TryOnService) {}

	// ── POST /api/tryon/generate ─────────────────────────────────────────────

	@Post("generate")
	@HttpCode(HttpStatus.ACCEPTED)
	@ApiOperation({
		summary: "Submit a virtual try-on request",
		description: `
Accepts a person image (Base64 data URI or public URL) and a garment image URL.
Returns a sessionId immediately. Processing is asynchronous — connect to the
Socket.io namespace \`/tryon\` and emit \`tryon:join_session\` with
\`{ sessionId }\` to receive live status updates.

Alternatively, poll \`GET /api/tryon/sessions/:id\` for the current status.
    `,
	})
	@ApiAcceptedResponse({
		type: TryOnSessionResponseDto,
		description: "Session created and queued for processing.",
	})
	@ApiBadRequestResponse({
		description:
			"Validation error — missing/invalid personImage or garmentImage.",
	})
	async generate(
		@Body() dto: GenerateTryOnDto,
		@Session() session: UserSession<typeof auth>,
	): Promise<TryOnSessionResponseDto> {
		const userId = session?.user?.id;
		const result = await this.tryOnService.createSession(dto, userId);

		return {
			sessionId: result.sessionId,
			status: result.status,
			message:
				`Job queued. Connect to Socket.io namespace '/tryon' and emit ` +
				`'tryon:join_session' with { sessionId: '${result.sessionId}' } ` +
				`to receive live updates.`,
		};
	}

	// ── GET /api/tryon/sessions ──────────────────────────────────────────────

	@Get("sessions")
	@ApiOperation({ summary: "List current user's try-on history" })
	@ApiQuery({
		name: "page",
		required: false,
		type: Number,
		description: "Page number (default: 1)",
	})
	@ApiQuery({
		name: "limit",
		required: false,
		type: Number,
		description: "Items per page (default: 20)",
	})
	@ApiOkResponse({ description: "Paginated list of try-on sessions." })
	async listSessions(
		@Session() session: UserSession<typeof auth>,
		@Query("page") page = 1,
		@Query("limit") limit = 20,
	) {
		const userId = session.user.id;
		return this.tryOnService.getSessionsByUser(
			userId,
			Number(page),
			Number(limit),
		);
	}

	// ── GET /api/tryon/sessions/:id ──────────────────────────────────────────

	@Get("sessions/:id")
	@ApiOperation({
		summary: "Get try-on session status by ID",
		description: "Polling fallback — use Socket.io for real-time updates.",
	})
	@ApiOkResponse({
		type: TryOnSessionDetailDto,
		description: "Session details including current status and result URL.",
	})
	async getSession(
		@Param("id") id: string,
		@Session() session: UserSession<typeof auth>,
	) {
		return this.tryOnService.getSessionById(id, session.user.id);
	}
}
