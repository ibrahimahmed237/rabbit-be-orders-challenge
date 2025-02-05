// src/order/order.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDTO } from './dto/create-order-dto';
import { OrderRepository } from './order.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ProductService } from '../product/product.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productService: ProductService,
    private readonly notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(orderData: CreateOrderDTO) {
    if (
      orderData.customerId === null ||
      orderData.customerId === undefined ||
      isNaN(orderData.customerId)
    ) {
      throw new BadRequestException('Order must have a valid customer ID');
    }
    // Validate order items
    if (!orderData.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Validate products exist and have sufficient quantity
    const productValidations = await Promise.all(
      orderData.items.map(async (item) => {
        if(isNaN(item.productId) || isNaN(item.quantity) || item.quantity <= 0 || typeof item.productId !== 'number' || typeof item.quantity !== 'number') {
          throw new BadRequestException('Invalid product ID or quantity');
        }
        const product = await this.productService.getProductById(
          item.productId,
        );
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }
        return product;
      }),
    );
    const order = await this.orderRepository.create(orderData);

    // Send notification for new order
    await this.notificationService.sendOrderNotification(order.id, order.customerId);

    // Invalidate relevant caches
    await this.invalidateProductCaches(orderData);

    return order;
  }

  private async invalidateProductCaches(orderData: CreateOrderDTO) {
    const productIds = orderData.items.map((item) => item.productId);

    // Invalidate individual product caches
    for (const id of productIds) {
      await this.cacheManager.del(`product:${id}`);
    }

    // Invalidate list caches
    await this.cacheManager.del('products:*');

    // Invalidate top products caches
    await this.cacheManager.del('top-products:*');
  }
}
