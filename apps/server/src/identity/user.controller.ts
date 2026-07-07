import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../common/auth";
import { ListUsersQuery } from "./dto/list-users.query";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@ApiTags("users")
@Controller("users")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get("me")
	@ApiOperation({ summary: "Current user with customer and seller profiles" })
	getMe(@Session() session: UserSession<typeof auth>) {
		return this.userService.getMe(session.user.id);
	}

	@Patch("me")
	@ApiOperation({ summary: "Update current user's base fields" })
	updateMe(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: UpdateUserDto,
	) {
		return this.userService.updateBaseUser(session.user.id, dto);
	}

	@Delete("me")
	@ApiOperation({ summary: "Deactivate current user's account" })
	deactivateMe(@Session() session: UserSession<typeof auth>) {
		return this.userService.deactivateSelf(session.user.id);
	}

	@Get()
	@Roles(["admin"])
	@ApiOperation({ summary: "List users (admin)" })
	list(@Query() query: ListUsersQuery) {
		return this.userService.list(query);
	}

	@Get(":id")
	@Roles(["admin"])
	@ApiOperation({ summary: "Get a user by id (admin)" })
	getById(@Param("id") id: string) {
		return this.userService.getById(id);
	}
}
