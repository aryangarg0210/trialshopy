import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { AddWishlistItemDto } from "./dto/add-wishlist-item.dto";
import { WishlistService } from "./wishlist.service";

@ApiTags("wishlist")
@Controller("wishlist")
export class WishlistController {
	constructor(private readonly wishlistService: WishlistService) {}

	@Get()
	@ApiOperation({ summary: "List the current user's wishlist products" })
	list(@Session() session: UserSession<typeof auth>) {
		return this.wishlistService.list(session.user.id);
	}

	@Post("items")
	@ApiOperation({ summary: "Add a product to the wishlist" })
	@ApiOkResponse({ schema: { example: { added: true } } })
	add(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: AddWishlistItemDto,
	) {
		return this.wishlistService.add(session.user.id, dto.productId);
	}

	@Delete("items/:productId")
	@ApiOperation({ summary: "Remove a product from the wishlist" })
	@ApiOkResponse({ schema: { example: { removed: true } } })
	remove(
		@Session() session: UserSession<typeof auth>,
		@Param("productId") productId: string,
	) {
		return this.wishlistService.remove(session.user.id, productId);
	}
}
