import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductsDTO } from './dto/get-all-products.dto';
import { TopProductsResponseDTO } from './dto/top-products.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('product')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @Get()
  async getAllProducts(@Query() filters: GetAllProductsDTO) {
    return this.productsService.getAllProducts(filters);
  }

  @Get('top/:area')
  async getTopProducts(@Param('area') area: string): Promise<TopProductsResponseDTO[]> {
    return this.productsService.getTopProducts(area);
  }

  // skip rate limiting for this endpoint
  @SkipThrottle()
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(Number(id));
  }
}
