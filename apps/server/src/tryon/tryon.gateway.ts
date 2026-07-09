import { Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
	TRYON_EVENTS,
	TRYON_SESSION_UPDATED_EVENT,
	type TryOnSessionUpdatedPayload,
} from "./tryon.types";

/**
 * TryOnGateway
 *
 * Socket.io WebSocket gateway that handles real-time try-on progress updates.
 *
 * ## Client Flow
 *  1. Connect to the WebSocket server (same host:port as HTTP).
 *  2. After POST /api/tryon/generate, receive `sessionId` in HTTP response.
 *  3. Emit `tryon:join_session` with `{ sessionId }` to subscribe to that room.
 *  4. Listen for server events:
 *       `tryon:queued`     — job accepted, processing about to start
 *       `tryon:running`    — Python bridge is working; may include queue rank/ETA
 *       `tryon:completed`  — { sessionId, resultUrl }
 *       `tryon:failed`     — { sessionId, errorMessage }
 *       `tryon:progress`   — intermediate { rank, rankEta, msg } updates
 *
 * ## Architecture Note
 * The gateway does NOT call the bridge directly. It only listens for internal
 * NestJS EventEmitter events (`tryon.session.updated`) fired by the
 * TryOnProcessor and relays them to the correct Socket.io room.
 * This keeps the processor fully decoupled from Socket.io.
 *
 * ## Room Strategy
 * Each session gets its own Socket.io room named `tryon:session:<sessionId>`.
 * Multiple browser tabs / devices can join the same session room and all
 * receive the updates simultaneously.
 */
@WebSocketGateway({
	cors: {
		origin: process.env.CORS_URLS?.split(",") ?? ["http://localhost:3000"],
		credentials: true,
	},
	namespace: "/tryon",
	transports: ["websocket", "polling"],
})
export class TryOnGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	private server: Server;

	private readonly logger = new Logger(TryOnGateway.name);

	afterInit(server: Server) {
		this.logger.log("TryOn WebSocket Gateway initialised.");
	}

	handleConnection(client: Socket) {
		this.logger.log(
			`Client connected: ${client.id} from ${client.handshake.address}`,
		);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	// ── Client → Server ──────────────────────────────────────────────────────

	/**
	 * Handles the `tryon:join_session` event from the client.
	 *
	 * The client emits: `{ sessionId: "..." }`
	 * The server joins the socket into the room `tryon:session:<sessionId>`
	 * so it will receive all future events for that session.
	 */
	@SubscribeMessage(TRYON_EVENTS.JOIN_SESSION)
	handleJoinSession(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { sessionId: string },
	) {
		const { sessionId } = payload;
		if (!sessionId) {
			client.emit("error", { message: "sessionId is required." });
			return;
		}

		const room = this.roomName(sessionId);
		client.join(room);
		this.logger.log(`Socket ${client.id} joined room ${room}`);

		// Acknowledge the join
		client.emit(TRYON_EVENTS.QUEUED, {
			sessionId,
			message: "Subscribed to try-on session updates.",
		});
	}

	// ── Internal Events → WebSocket Broadcast ────────────────────────────────

	/**
	 * Listens for `tryon.session.updated` events fired by TryOnProcessor
	 * and relays them to the relevant Socket.io room.
	 */
	@OnEvent(TRYON_SESSION_UPDATED_EVENT)
	handleSessionUpdated(payload: TryOnSessionUpdatedPayload) {
		const { sessionId, status, resultUrl, errorMessage, progress } = payload;
		const room = this.roomName(sessionId);

		switch (status) {
			case "running":
				if (progress) {
					// Intermediate queue/rank update
					this.server.to(room).emit(TRYON_EVENTS.PROGRESS, {
						sessionId,
						...progress,
					});
				} else {
					this.server.to(room).emit(TRYON_EVENTS.RUNNING, {
						sessionId,
						message: "AI model is processing your try-on…",
					});
				}
				break;

			case "completed":
				this.server.to(room).emit(TRYON_EVENTS.COMPLETED, {
					sessionId,
					resultUrl,
					message: "Your virtual try-on is ready!",
				});
				break;

			case "failed":
				this.server.to(room).emit(TRYON_EVENTS.FAILED, {
					sessionId,
					errorMessage,
					message: "Virtual try-on failed. Please try again.",
				});
				break;

			default:
				break;
		}

		this.logger.log(
			`Emitted status=${status} to room ${room}`,
		);
	}

	// ── Helper ────────────────────────────────────────────────────────────────

	private roomName(sessionId: string): string {
		return `tryon:session:${sessionId}`;
	}
}
