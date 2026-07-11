import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { ListStudentVerificationsQuery } from "./dto/list-student-verifications.query";
import { PaginatedStudentVerificationsResponseDto } from "./dto/responses/paginated-student-verifications.response";
import { StudentVerificationResponseDto } from "./dto/responses/student-verification.response";
import { SubmitStudentVerificationDto } from "./dto/submit-student-verification.dto";
import { UpdateVerificationStatusDto } from "./dto/update-verification-status.dto";
import { StudentVerificationService } from "./student-verification.service";

@ApiTags("student-verifications")
@Controller("student-verifications")
export class StudentVerificationController {
	constructor(
		private readonly verificationService: StudentVerificationService,
	) {}

	@Post()
	@ApiOperation({ summary: "Submit or replace a student ID for verification" })
	@ApiOkResponse({ type: StudentVerificationResponseDto })
	submit(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: SubmitStudentVerificationDto,
	) {
		return this.verificationService.submit(session.user.id, dto);
	}

	@Get("mine")
	@ApiOperation({ summary: "List the current user's student verifications" })
	@ApiOkResponse({ type: [StudentVerificationResponseDto] })
	listMine(@Session() session: UserSession<typeof auth>) {
		return this.verificationService.listMine(session.user.id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List student verifications (admin)" })
	@ApiOkResponse({ type: PaginatedStudentVerificationsResponseDto })
	list(@Query() query: ListStudentVerificationsQuery) {
		return this.verificationService.list(query);
	}

	@Patch(":id/status")
	@Roles(["admin"])
	@ApiOperation({ summary: "Approve or reject a student verification (admin)" })
	@ApiOkResponse({ type: StudentVerificationResponseDto })
	updateStatus(
		@Param("id") id: string,
		@Body() dto: UpdateVerificationStatusDto,
	) {
		return this.verificationService.updateStatus(id, dto.status);
	}
}
