import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
      const findProduct = await this.productRepository.findOne({
        where: { name: createProductDto.name },
      });
      if (findProduct) {
        throw new ConflictException('Producto ya existe debe ser unico');
      }
      const categories:Category[] = await this.categoryRepository.find({
        where: { id: In(createProductDto.categoriesIds) },
      });

      if (categories.length !== createProductDto.categoriesIds.length) {
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
    // 1. Buscar el producto CON SUS CATEGORÍAS
    const findProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['categories'] // <-- Cargar relaciones
    });
    
    if (!findProduct) {
      throw new NotFoundException('Producto no encontrado'); // <-- Mejor excepción
    }

    // 2. Verificar duplicados de nombre
    if (updateProductDto.name) {
      const existingProduct = await this.productRepository.findOne({ // <-- Corregido repositorio
        where: { name: updateProductDto.name, id: Not(id) },
      });
      if (existingProduct) {
        throw new ConflictException('Nombre de producto ya existe');
      }
    }
    // 3. Actualizar propiedades simples
    this.productRepository.merge(findProduct, updateProductDto);



    // 4. Manejar categorías (solo si vienen en el DTO)
    if (updateProductDto.categoriesIds) {
      const categoriesFind = await this.categoryRepository.find({
        where: { id: In(updateProductDto.categoriesIds) },
      });

      if (categoriesFind.length !== updateProductDto.categoriesIds.length) {
        throw new NotFoundException('Una o mas categorias no existen');
      }
      
      findProduct.categories = categoriesFind;
    }

    return await this.productRepository.save(findProduct);
    
  } catch (error) {
    // Manejo específico de errores
    if (error instanceof NotFoundException || error instanceof ConflictException) {
      throw error;
    }
    throw new InternalServerErrorException('Error al actualizar el producto');
  }
}

  async removeProduct(id: string) {

    const productExist = await this.removeCategoryFromProduct(id);

    await this.productRepository.remove(productExist);

    return `Producto con el nombre ${productExist.name} borrado`;
  }

  async removeCategoryFromProduct(id: string): Promise<Product> {
      const product = await  await this.productRepository.findOne({
                      where: { id },
                      relations: ['categories']
                    });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      product.categories = [];

      return this.productRepository.save(product);
    }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const findCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name,
      },
    });
    if (findCategory) {
      throw new ConflictException( "Categoria ya existe debe ser unica" );
    }

    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  
}
