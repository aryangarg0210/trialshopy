import { PartialType } from "@nestjs/swagger";
import { CreateCourierPartnerDto } from "./create-courier-partner.dto";

export class UpdateCourierPartnerDto extends PartialType(
	CreateCourierPartnerDto,
) {}
