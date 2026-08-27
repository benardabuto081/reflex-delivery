import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { DeliveriesService } from "./deliveries.service";
import { InvalidTransitionError } from "./delivery-state-machine";
import { BadRequestException } from "@nestjs/common";

@Controller("deliveries")
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
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
