import { Body, Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { RemoveCartItemDto } from "./dto/remove-cart-item.dto";
import { CartResponseDto } from "./dto/responses/cart.response";
import { SetCartAddressDto } from "./dto/set-cart-address.dto";

@ApiTags("cart")
@Controller("cart")
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get()
	@ApiOperation({ summary: "Get the current user's cart" })
	@ApiOkResponse({ type: CartResponseDto })
	getMine(@Session() session: UserSession<typeof auth>) {
		return this.cartService.getMine(session.user.id);
	}

	@Post("items")
	@ApiOperation({
		summary: "Add an item (increments if the line already exists)",
	})
	@ApiOkResponse({ type: CartResponseDto })
	addItem(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: AddCartItemDto,
	) {
		return this.cartService.addItem(session.user.id, dto);
	}

	@Patch("items")
	@ApiOperation({ summary: "Set an existing line's quantity" })
	@ApiOkResponse({ type: CartResponseDto })
	setItemQuantity(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: AddCartItemDto,
	) {
		return this.cartService.setItemQuantity(session.user.id, dto);
	}

	@Delete("items")
	@ApiOperation({ summary: "Remove a line from the cart" })
	@ApiOkResponse({ type: CartResponseDto })
	removeItem(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: RemoveCartItemDto,
	) {
		return this.cartService.removeItem(session.user.id, dto);
	}

	@Delete()
	@ApiOperation({ summary: "Clear all items from the cart" })
	@ApiOkResponse({ type: CartResponseDto })
	clear(@Session() session: UserSession<typeof auth>) {
		return this.cartService.clear(session.user.id);
	}

	@Patch("address")
	@ApiOperation({ summary: "Set the cart's delivery address" })
	@ApiOkResponse({ type: CartResponseDto })
	setAddress(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: SetCartAddressDto,
	) {
		return this.cartService.setAddress(session.user.id, dto.addressId);
	}
}
