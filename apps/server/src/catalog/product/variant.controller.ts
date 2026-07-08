import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../../common/auth";
import { CreateVariantDto } from "./dto/create-variant.dto";
import { VariantResponseDto } from "./dto/responses/variant.response";
import { UpdateVariantDto } from "./dto/update-variant.dto";
import { VariantService } from "./variant.service";

@ApiTags("product-variants")
@Controller("products/mine/:productId/variants")
export class VariantController {
	constructor(private readonly variantService: VariantService) {}

	@Post()
	@Roles(["seller"])
	@ApiOperation({ summary: "Add a variant to one of the seller's products" })
	@ApiOkResponse({ type: VariantResponseDto })
	add(
		@Session() session: UserSession<typeof auth>,
		@Param("productId") productId: string,
		@Body() dto: CreateVariantDto,
	) {
		return this.variantService.add(session.user.id, productId, dto);
	}

	@Patch(":variantId")
	@Roles(["seller"])
	@ApiOperation({ summary: "Update a variant of one of the seller's products" })
	@ApiOkResponse({ type: VariantResponseDto })
	update(
		@Session() session: UserSession<typeof auth>,
		@Param("productId") productId: string,
		@Param("variantId") variantId: string,
		@Body() dto: UpdateVariantDto,
	) {
		return this.variantService.update(
			session.user.id,
			productId,
			variantId,
			dto,
		);
	}

	@Delete(":variantId")
	@Roles(["seller"])
	@ApiOperation({ summary: "Deactivate a variant of the seller's product" })
	@ApiOkResponse({ schema: { example: { deactivated: true } } })
	remove(
		@Session() session: UserSession<typeof auth>,
		@Param("productId") productId: string,
		@Param("variantId") variantId: string,
	) {
		return this.variantService.remove(session.user.id, productId, variantId);
	}
}
