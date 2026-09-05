import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rider.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!rider) {
      throw new NotFoundException("Rider not found");
    }

    return rider;
  }

  async getDeliveries(id: string) {
    await this.findOne(id); // ensures 404 if rider doesn't exist

    return this.prisma.delivery.findMany({
      where: { riderId: id },
      orderBy: { createdAt: "desc" },
    });
  }
}
