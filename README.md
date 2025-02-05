# Rabbit BE Orders Challenge

## Overview

This is a NestJS-based backend service that manages products and orders with a focus on high performance and scalability. The application implements advanced caching strategies, real-time notifications via Pushover, and follows best practices for enterprise-level applications. Key features include:

- Product and order management with MySQL database
- Application-level caching with optimized strategies
- Real-time order notifications through Pushover integration
- Comprehensive API testing suite with Postman collections
- Unit and E2E test coverage
- Environment-based configuration
- Performance optimizations for high-scale operations

## Assumptions Made

1. **Data Volume and Access Patterns**
   - High read to write ratio for product data
   - Product data changes infrequently
   - Top products list is dynamic and changes based on real-time order data, but caching for 5 minutes provides a good balance between data freshness and performance
   - Areas are predefined and stable

2. **Performance Requirements**
   - Response time should be under 200ms for 95th percentile
   - System should handle millions of requests per day
   - Cache hit ratio should be above 95%

3. **Business Logic**
   - Product ordering frequency is calculated based on the number of order items
   - A product belongs to only one area
   - Order history is retained indefinitely
   - All products are equally weighted in the calculation
   - Order notifications should be sent in real-time to administrators
   - Failed notifications should not block order processing

## Architecture

### Tech Stack
- **Framework**: NestJS
- **Database**: MySQL with Prisma ORM
- **Caching**: Application-level caching with cache-manager
- **Testing**: Jest

### Core Components

1. **Product Module**
   - `ProductController`: Handles HTTP requests for product operations
   - `ProductService`: Business logic layer with caching implementation
   - `ProductRepository`: Database interaction layer
   - DTOs: Data validation and transformation

2. **Order Module**
   - Manages order processing and tracking
   - Integrates with Product module for inventory management

3. **Cache Module**
   - Application-level caching
   - TTL-based cache invalidation
   - Area-specific caching for top products

## Key Features

### 1. Product Management
- CRUD operations for products
- Category and area-based filtering
- Pagination support
- Caching for frequently accessed data

### 2. Top Products Feature
- Area-based top product ranking
- Cache-first approach with 5-minute TTL
- Sorted by order frequency
- Limited to top 10 products per area

### 3. Performance Optimizations
- Efficient caching for high-traffic endpoints
- Efficient database queries with proper indexing
- Request validation using DTOs
- Error handling with appropriate HTTP status codes

## Testing Strategy

### Unit Tests
The application includes comprehensive unit tests focusing on core functionality:

1. **Product Service Tests**
   ```typescript
   describe('ProductService', () => {
     // Top Products Tests
     - Cache hit scenario
     - Cache miss scenario
     - Invalid area handling
     - Pagination and limit verification
     
     // Product Listing Tests
     - Cached products retrieval
     - Pagination handling
     
     // Single Product Tests
     - Invalid ID handling
     - Non-existent product handling
   });
   ```

### Test Coverage
- All service methods are tested
- Edge cases and error scenarios covered
- Cache interaction verification
- Repository method mocking

## API Endpoints

### Products
- `GET /product` - List all products with filtering
  - Query params: page, limit, categories
- `GET /product/:id` - Get single product
- `GET /product/top/:area` - Get top products by area

## Caching Strategy


1. **Product Listing**
   - Cache key: `products:{filters}`
   - TTL: Default cache duration
   - Invalidation: Automatic TTL expiry

2. **Single Product**
   - Cache key: `product:{id}`
   - TTL: Default cache duration
   - Invalidation: On product updates

3. **Top Products**
   - Cache key: `top-products:{area}`
   - TTL: 5 minutes (300000ms)
   - Sorted by order frequency

## Error Handling

1. **Input Validation**
   - DTO-based request validation
   - Proper error messages for invalid inputs

2. **Business Logic Errors**
   - `BadRequestException` for invalid inputs
   - `NotFoundException` for missing resources

## Performance Considerations

1. **Database**
   - Indexed queries for frequent operations
   - Efficient JOIN operations
   - Proper connection pooling

2. **Caching**
   - Application-level caching
   - Area-specific cache segmentation
   - Optimized cache key strategy

## Setup and Running the Application

### Prerequisites
- Node.js (v20 or higher)
- MySQL database
- Yarn package manager
- Pushover account and device (for notifications)

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env

# Database Configuration

DATABASE_URL=mysql://user:password@localhost:3306/dbname


# Pushover Notification Configuration

PUSHOVER_TOKEN=your_app_token_here    # Your Pushover application token

PUSHOVER_USER=your_user_key_here      # Your Pushover user key

```


### Notification System

The application uses Pushover for real-time order notifications:



1. **Features**

   - Real-time notifications for new orders

   - Configurable notification sound

   - Priority-based delivery

   - Retry mechanism for offline devices

   - 3-hour expiration for undelivered messages



2. **Setup Requirements**

   - Pushover account (sign up at https://pushover.net)

   - Active Pushover device (mobile app or desktop client)

   - Valid application token and user key in `.env`



3. **Error Handling**

   - Failed notifications are logged but don't affect order processing

   - Detailed error logging for debugging

   - Automatic retry for offline devices



### Installation and Setup
```bash
# Install dependencies
`yarn install` or `npm install`

# Generate Prisma client
`yarn prisma:generate`

# Run database migrations
`yarn migrate:dev`
# Seed the database
`yarn seed`

# Start the application in development mode
`yarn start:dev` or `npm run start:dev`
# Build and run in production mode
`yarn build`
`yarn start:prod`
or 
`npm run build`
`npm run start:prod`
# Run tests
`yarn test`
`yarn test:e2e`
or 
`npm run test`
`npm run test:e2e`
```

## API Testing with Postman

### Postman Collection
The project includes a Postman collection for testing all API endpoints. The collection is located in:
```
postman/Rabbit-BE-Orders.postman_collection.json
```

### Available Endpoints

1. **Get All Products**
   ```
   GET {{baseUrl}}/product
   Query Parameters:
   - page (optional): Page number
   - limit (optional): Items per page
   - categories[] (optional): Filter by categories
   ```


2. **Get Product by ID**
   ```
   GET {{baseUrl}}/product/:id
   Path Parameters:
   - id: Product ID
   ```


3. **Get Top Products by Area**
   ```
   GET {{baseUrl}}/product/top/:area
   Path Parameters:
   - area: Area name (e.g., "Maadi")
   ```


### Setting Up Postman

1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `postman/Rabbit-BE-Orders.postman_collection.json`

2. **Import Environment**
   - Click "Import"
   - Select `postman/environments/local.postman_environment.json`
   - Select "Local Environment" from the environment dropdown

3. **Environment Variables**
   - Local development: `baseUrl = http://localhost:8080`

### Testing Examples

1. **Get All Products with Filters**
   ```
   GET http://localhost:8080/product?page=1&limit=10&categories[]=Electronics
   ```


2. **Get Single Product**
   ```
   GET http://localhost:8080/product/:id
   ```


3. **Get Top Products in Area**
   ```
   GET http://localhost:8080/product/top/:area
   ```


## Testing

### Unit Tests
```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode
yarn test:watch
```

### E2E Tests
```bash
yarn test:e2e
```

## Error Handling

1. **Input Validation**
   - DTO-based request validation
   - Proper error messages for invalid inputs

2. **Business Logic Errors**
   - `BadRequestException` for invalid inputs
   - `NotFoundException` for missing resources

## Performance Considerations

1. **Database**
   - Indexed queries for frequent operations
   - Efficient JOIN operations
   - Proper connection pooling

2. **Caching**
   - Application-level caching
   - Area-specific cache segmentation
   - Optimized cache key strategy

## Future Improvements

1. **Caching**
   - Implement distributed caching
   - Add cache analytics
   - Implement cache prefetching

2. **Monitoring**
   - Add performance metrics
   - Implement logging strategy
   - Add health checks

3. **Scalability**
   - Implement horizontal scaling
   - Add load balancing
   - Implement circuit breakers

## License
This project is licensed under the UNLICENSED license.