import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category';
import { In, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
      constructor(
      @InjectRepository(Category)
      private readonly categoryRepository: Repository<Category>,
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
    ) { }
  async create(createProductDto: CreateProductDto) {
    try {
      const findProduct = await this.categoryRepository.findOne({
        where: { name: createProductDto.name },
      });
      if (findProduct) {
        throw new ConflictException('Producto ya existe debe ser unico');
      }
      const categories:Category[] = await this.categoryRepository.find({
        where: { id: In(createProductDto.categories) },
      });

      if (categories.length !== createProductDto.categories.length) {
        throw new ConflictException('Una o mas categorias no existen');
      }
      const newProduct = this.productRepository.create({...createProductDto, categories});

      return this.productRepository.save(newProduct);
    } catch (error) {
      throw new ConflictException(error.message);
      
    }
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const findProduct = await this.categoryRepository.findOne({
        where: { id },
      });
      if (!findProduct) {
        throw new ConflictException('Producto no encontrado');
      }
      if (updateProductDto.name) {
        const existingProduct = await this.categoryRepository.findOne({
          where: { name: updateProductDto.name, id: Not(id) },
        });
        if (existingProduct) {
          throw new ConflictException('Nombre de producto ya existe');
        }
      }
      const updatedProduct = this.categoryRepository.merge(findProduct, updateProductDto);
      return this.categoryRepository.save(updatedProduct);
    } catch (error) {
      throw new ConflictException(error.message);
      
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }


  async createCategory(createCategoryDto: CreateCategoryDto) {
    const findCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name,
      },
    });
    if (findCategory) {
      throw new ConflictException( "Categoria ya existe debe ser unica" );
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }
  
}
