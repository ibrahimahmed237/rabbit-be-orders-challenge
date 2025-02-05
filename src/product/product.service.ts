import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { GetAllProductsDTO } from './dto/get-all-products.dto';
import { TopProductsResponseDTO } from './dto/top-products.dto';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAllProducts(filters: GetAllProductsDTO) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cachedProducts = await this.cacheManager.get(cacheKey);
    
    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this.productRepository.findAll(filters);
    await this.cacheManager.set(cacheKey, products);
    
    return products;
  }

  async getProductById(id: number) {
    const cacheKey = `product:${id}`;
    const cachedProduct = await this.cacheManager.get(cacheKey);
    
    if (cachedProduct) {
      return cachedProduct;
    }
    if (isNaN(id)) {
      throw new BadRequestException('Invalid product ID');
    }
        
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, product);
    return product;
  }

  async getTopProducts(area: string): Promise<TopProductsResponseDTO[]> {
    if (!area || typeof area !== 'string') {
      throw new BadRequestException('Invalid area');
    }

    const cacheKey = `top-products:${area}`;
    const cachedTopProducts = await this.cacheManager.get<TopProductsResponseDTO[]>(cacheKey);
    
    if (cachedTopProducts) {
      return cachedTopProducts;
    }

    const topProducts = await this.productRepository.findTopProducts(area);
    await this.cacheManager.set(cacheKey, topProducts, 300000); // Cache for 5 minutes
    
    return topProducts;
  }
}