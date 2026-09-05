import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { RidersService } from "./riders.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("riders")
@UseGuards(JwtAuthGuard)
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Get()
  findAll() {
    return this.ridersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ridersService.findOne(id);
  }

  @Get(":id/deliveries")
  getDeliveries(@Param("id") id: string) {
    return this.ridersService.getDeliveries(id);
  }
}
