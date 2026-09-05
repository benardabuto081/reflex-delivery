import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
    role: "RETAILER" | "DISPATCHER" | "RIDER";
    storeId?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Retailers need a store to attach deliveries to. If none was
    // provided, auto-create one so registration never leaves a
    // Retailer in an unusable state with no store.
    let storeId = data.storeId;
    if (data.role === "RETAILER" && !storeId) {
      const store = await this.prisma.store.create({
        data: {
          name: `${data.name}'s Store`,
          address: "Not yet provided",
        },
      });
      storeId = store.id;
    }

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        storeId,
      },
    });
  }
}
