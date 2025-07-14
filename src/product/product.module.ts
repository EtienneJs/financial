import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
        TypeOrmModule.forFeature([
          Product,
          Category
        ]),
  ],
  exports: [
    ProductService
  ]
})
export class ProductModule {}
