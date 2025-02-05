-- AlterTable
ALTER TABLE `product` MODIFY `category` VARCHAR(255) NOT NULL,
    MODIFY `area` VARCHAR(255) NOT NULL;

-- RenameIndex
ALTER TABLE `orderitem` RENAME INDEX `idx_orderItem_orderId` TO `OrderItem_orderId_idx`;

-- RenameIndex
ALTER TABLE `orderitem` RENAME INDEX `idx_orderItem_productId` TO `OrderItem_productId_idx`;

-- RenameIndex
ALTER TABLE `product` RENAME INDEX `idx_product_area` TO `Product_area_idx`;

-- RenameIndex
ALTER TABLE `product` RENAME INDEX `idx_product_category` TO `Product_category_idx`;
