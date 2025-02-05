import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductModule } from '../product/product.module';
import { ProductService } from '../product/product.service';
import { ProductRepository } from '../product/product.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ProductModule, NotificationModule],
  controllers: [OrderController],
  providers: [
    PrismaService,
    OrderService, 
    OrderRepository,
    ProductService,
    ProductRepository
  ],
})
export class OrderModule {}
