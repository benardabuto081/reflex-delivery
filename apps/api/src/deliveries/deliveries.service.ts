import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  DeliveryStatus,
  assertValidTransition,
} from "./delivery-state-machine";

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    storeId: string;
    createdById: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    description: string;
  }) {
    const reference = "RX-" + Date.now().toString(36).toUpperCase();

    const delivery = await this.prisma.delivery.create({
      data: {
        reference,
        storeId: data.storeId,
        createdById: data.createdById,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        description: data.description,
        status: "PENDING",
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        deliveryId: delivery.id,
        actorId: data.createdById,
        action: "CREATED",
        previousStatus: null,
        newStatus: "PENDING",
      },
    });

    return delivery;
  }

  async findAll() {
    return this.prisma.delivery.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });
    if (!delivery) {
      throw new NotFoundException("Delivery not found");
    }
    return delivery;
  }

  async assign(id: string, riderId: string, actorId: string) {
    const delivery = await this.findOne(id);
    assertValidTransition(delivery.status as DeliveryStatus, "ASSIGNED");

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        riderId,
        status: "ASSIGNED",
        assignedAt: new Date(),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        deliveryId: id,
        actorId,
        action: "ASSIGNED",
        previousStatus: delivery.status,
        newStatus: "ASSIGNED",
      },
    });

    return updated;
  }

  async pickup(id: string, actorId: string) {
    const delivery = await this.findOne(id);
    assertValidTransition(delivery.status as DeliveryStatus, "PICKED_UP");

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: "PICKED_UP",
        pickedUpAt: new Date(),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        deliveryId: id,
        actorId,
        action: "PICKED_UP",
        previousStatus: delivery.status,
        newStatus: "PICKED_UP",
      },
    });

    return updated;
  }

  async deliver(id: string, actorId: string) {
    const delivery = await this.findOne(id);
    assertValidTransition(delivery.status as DeliveryStatus, "DELIVERED");

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        deliveryId: id,
        actorId,
        action: "DELIVERED",
        previousStatus: delivery.status,
        newStatus: "DELIVERED",
      },
    });

    return updated;
  }

  async getAuditHistory(id: string) {
    await this.findOne(id); // ensures 404 if delivery doesn't exist
    return this.prisma.auditEvent.findMany({
      where: { deliveryId: id },
      orderBy: { createdAt: "asc" },
    });
  }
}
