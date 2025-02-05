import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { GetAllProductsDTO } from './dto/get-all-products.dto';
import { TopProductsResponseDTO } from './dto/top-products.dto';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: GetAllProductsDTO): Promise<Product[]> {
    let { categories, page = 1, limit = 10 } = filters;
    if (categories?.length === 0) {
      categories = undefined;
    }
    limit = Math.min(limit, 10);
    page = Math.max(page, 1);
    let skip = (page - 1) * limit;

    return this.prisma.product.findMany({
      where:
        categories?.length > 0
          ? {
              category: {
                in: categories,
              },
            }
          : undefined,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id }
    });
  }

  async findTopProducts(area: string): Promise<TopProductsResponseDTO[]> {
    const topProducts = await this.prisma.product.findMany({
      where: {
        area,
      },
      select: {
        id: true,
        name: true,
        category: true,
        area: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      area: product.area,
      orderCount: product._count.orders,
    }));
  }
}
