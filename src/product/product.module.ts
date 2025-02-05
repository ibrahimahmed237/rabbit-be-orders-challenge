import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300000, // 5 minutes
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, PrismaService],
  exports: [ProductService]
})
export class ProductModule {}