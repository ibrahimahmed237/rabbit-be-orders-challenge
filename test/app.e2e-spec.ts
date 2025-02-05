import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prismaService.orderItem.deleteMany();
    await prismaService.order.deleteMany();
    await prismaService.product.deleteMany();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/product (GET)', () => {
    beforeEach(async () => {
      // Seed test data
      await prismaService.product.createMany({
        data: [
          { name: 'Product 1', category: 'Electronics', area: 'Maadi' },
          { name: 'Product 2', category: 'Electronics', area: 'Maadi' },
          { name: 'Product 3', category: 'Fashion', area: 'Nasr City' },
        ],
      });
    });

    it('should return all products with pagination', () => {
      return request(app.getHttpServer())
        .get('/product?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('category');
          expect(res.body[0]).toHaveProperty('area');
        });
    });

    it('should filter products by category', () => {
      return request(app.getHttpServer())
        .get('/product?categories[]=Electronics')
        .expect(200)
        .expect((res) => {
          expect(res.body.every((product) => product.category === 'Electronics')).toBe(true);
        });
    });
  });

  describe('/product/top/:area (GET)', () => {
    beforeEach(async () => {
      // Create test products and orders
      const product1 = await prismaService.product.create({
        data: { name: 'Popular Product', category: 'Electronics', area: 'Maadi' },
      });

      const product2 = await prismaService.product.create({
        data: { name: 'Less Popular', category: 'Electronics', area: 'Maadi' },
      });

      const order = await prismaService.order.create({
        data: { customerId: 1 },
      });

      // Create more order items for product1 to make it more popular
      await prismaService.orderItem.createMany({
        data: [
          { productId: product1.id, orderId: order.id, quantity: 1 },
          { productId: product1.id, orderId: order.id, quantity: 1 },
          { productId: product2.id, orderId: order.id, quantity: 1 },
        ],
      });
    });

    it('should return top products for a given area', () => {
      return request(app.getHttpServer())
        .get('/product/top/Maadi')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(10);
          expect(res.body[0].name).toBe('Popular Product');
        });
    });

    it('should return 400 for invalid area', () => {
      return request(app.getHttpServer())
        .get('/product/top/')
        .expect(400);
    });
  });

  describe('/product/:id (GET)', () => {
    let testProduct;

    beforeEach(async () => {
      testProduct = await prismaService.product.create({
        data: { name: 'Test Product', category: 'Test', area: 'Test Area' },
      });
    });

    it('should return a product by id', () => {
      return request(app.getHttpServer())
        .get(`/product/${testProduct.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProduct.id);
          expect(res.body.name).toBe(testProduct.name);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/product/999999')
        .expect(404);
    });
  });
});
