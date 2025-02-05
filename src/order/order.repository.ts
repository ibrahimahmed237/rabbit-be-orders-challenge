import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order-dto';

@Injectable()
export class OrderRepository {
  constructor(private prisma: PrismaService) {}

  async create(orderData: CreateOrderDTO) {
    return this.prisma.order.create({
      data: {
        customerId: orderData.customerId,
        items: {
          create: orderData.items.map(item => ({
            quantity: item.quantity,
            product: {
              connect: {
                id: item.productId,
              },
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}