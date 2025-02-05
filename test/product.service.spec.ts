import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../src/product/product.service';
import { ProductRepository } from '../src/product/product.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;
  let cacheManager: Cache;

  const mockProductRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findTopProducts: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopProducts', () => {
    const mockArea = 'Maadi';
    const mockTopProducts = [
      {
        id: 1,
        name: 'Product 1',
        category: 'Category 1',
        area: 'Maadi',
        orderCount: 100,
      },
      {
        id: 2,
        name: 'Product 2',
        category: 'Category 1',
        area: 'Maadi',
        orderCount: 90,
      },
    ];

    it('should return cached top products if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockTopProducts);

      const result = await service.getTopProducts(mockArea);

      expect(result).toEqual(mockTopProducts);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`top-products:${mockArea}`);
      expect(mockProductRepository.findTopProducts).not.toHaveBeenCalled();
    });

    it('should fetch and cache top products if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProductRepository.findTopProducts.mockResolvedValue(mockTopProducts);

      const result = await service.getTopProducts(mockArea);

      expect(result).toEqual(mockTopProducts);
      expect(mockProductRepository.findTopProducts).toHaveBeenCalledWith(mockArea);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `top-products:${mockArea}`,
        mockTopProducts,
        300000
      );
    });

    it('should throw BadRequestException for invalid area', async () => {
      await expect(service.getTopProducts('')).rejects.toThrow(BadRequestException);
      await expect(service.getTopProducts(undefined)).rejects.toThrow(BadRequestException);
    });

    it('should return exactly 10 products when more are available', async () => {
      const manyProducts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        category: 'Category 1',
        area: mockArea,
        orderCount: 100 - i,
      }));

      mockCacheManager.get.mockResolvedValue(null);
      mockProductRepository.findTopProducts.mockResolvedValue(manyProducts);

      const result = await service.getTopProducts(mockArea);

      expect(result).toHaveLength(10);
      expect(result[0].orderCount).toBeGreaterThanOrEqual(result[9].orderCount);
    });
  });

  describe('getAllProducts', () => {
    const mockFilters = {
      categories: ['Category 1'],
      page: 1,
      limit: 10,
    };

    it('should return cached products if available', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }];
      mockCacheManager.get.mockResolvedValue(mockProducts);

      const result = await service.getAllProducts(mockFilters);

      expect(result).toEqual(mockProducts);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`products:${JSON.stringify(mockFilters)}`);
      expect(mockProductRepository.findAll).not.toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      await service.getAllProducts({ page: 2, limit: 5 });

      expect(mockProductRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
      });
    });
  });

  describe('getProductById', () => {
    it('should throw BadRequestException for invalid ID', async () => {
      await expect(service.getProductById(NaN)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(service.getProductById(999)).rejects.toThrow(NotFoundException);
    });
  });
}); 