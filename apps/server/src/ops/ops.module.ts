import { Module } from "@nestjs/common";
import { CourierPartnerController } from "./courier-partner/courier-partner.controller";
import { CourierPartnerService } from "./courier-partner/courier-partner.service";
import { TicketController } from "./ticket/ticket.controller";
import { TicketService } from "./ticket/ticket.service";

@Module({
	controllers: [TicketController, CourierPartnerController],
	providers: [TicketService, CourierPartnerService],
})
export class OpsModule {}
