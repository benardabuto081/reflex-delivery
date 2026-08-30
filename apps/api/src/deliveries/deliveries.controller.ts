import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { DeliveriesService } from "./deliveries.service";
import { InvalidTransitionError } from "./delivery-state-machine";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@Controller("deliveries")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles("RETAILER")
  create(
    @Body()
    body: {
      storeId: string;
      createdById: string;
      customerName: string;
      customerPhone: string;
      deliveryAddress: string;
      description: string;
    },
  ) {
    return this.deliveriesService.create(body);
  }

  @Get()
  findAll() {
    return this.deliveriesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Get(":id/events")
  getAuditHistory(@Param("id") id: string) {
    return this.deliveriesService.getAuditHistory(id);
  }

  @Post(":id/assign")
  @Roles("DISPATCHER")
  async assign(
    @Param("id") id: string,
    @Body() body: { riderId: string; actorId: string },
  ) {
    try {
      return await this.deliveriesService.assign(id, body.riderId, body.actorId);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post(":id/pickup")
  @Roles("RIDER")
  async pickup(@Param("id") id: string, @Body() body: { actorId: string }) {
    try {
      return await this.deliveriesService.pickup(id, body.actorId);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post(":id/deliver")
  @Roles("RIDER")
  async deliver(@Param("id") id: string, @Body() body: { actorId: string }) {
    try {
      return await this.deliveriesService.deliver(id, body.actorId);
    } catch (err) {
      if (err instanceof InvalidTransitionError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
