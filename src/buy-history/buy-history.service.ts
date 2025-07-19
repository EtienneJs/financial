import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBuyHistoryDto } from './dto/create-buy-history.dto';
import { UpdateBuyHistoryDto } from './dto/update-buy-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuyHistory } from './entities/buy-history.entity';
import { BuyHistoryDetalle } from './entities/buy-history-detalle.entity';
import { BankAccountService } from 'src/bank/bank-account.service';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/product/entities/product.entity';
import { BankAccount } from 'src/bank/entities/bank-account.entity';
import { CreateBuyHistoryDetalleDto } from './dto/create-buy-history-detalle.dto';
@Injectable()
export class BuyHistoryService {

    constructor(
      @InjectRepository(BuyHistory)
      private readonly buyHistoryRepository: Repository<BuyHistory>,
      @InjectRepository(BuyHistoryDetalle)
      private readonly buyHistoryDetalleRepository: Repository<BuyHistoryDetalle>,
      
      private readonly bankAccountService: BankAccountService,
      private readonly productService: ProductService,
    ) { }
  findAll() {
    return `This action returns all buyHistory`;
  }

  async findOne(id: string):Promise<BuyHistory> {
    const findBuyHistory = await this.buyHistoryRepository.findOne({
      where : {id}
    })
    if(!findBuyHistory){
      throw new NotFoundException("History not found")
    }
    return findBuyHistory;
  }

async update(id: string, updateBuyHistoryDto: UpdateBuyHistoryDto) {
  // Iniciamos una transacción para asegurar la atomicidad de todas las operaciones
  await this.buyHistoryRepository.manager.transaction(async (manager) => {
    const { bankAcount, description, detailBuy } = updateBuyHistoryDto;

    // Buscamos la compra existente junto con su cuenta bancaria relacionada
    const buyHistory = await manager.findOne(BuyHistory, {
      where: { id },
      relations: ['banckAccount'],
    });

    if (!buyHistory) {
      throw new NotFoundException('Compra no encontrada');
    }

    let oldAccount: BankAccount | null = null;
    let totalDifference = 0;

    // === CAMBIO DE CUENTA BANCARIA ===
    // Si se proporciona una nueva cuenta, la comparamos con la actual
    // Si es diferente, la actualizamos y guardamos la antigua para ajustar el saldo después
    if (bankAcount) {
      const newAccount = await this.bankAccountService.findOne(bankAcount);
      if (newAccount.id !== buyHistory.banckAccount.id) {
        oldAccount = buyHistory.banckAccount;
        buyHistory.banckAccount = newAccount;
      }
    }

    // === ACTUALIZACIÓN DE PRODUCTOS DE LA COMPRA ===
    if (detailBuy) {
      // Validamos que no venga vacío
      if (!detailBuy.length) {
        throw new ConflictException("El detalle de compra no puede estar vacío");
      }

      // Obtenemos los IDs de los productos que se desean registrar
      const productIds = detailBuy.map(d => d.productId);

      // Consultamos los productos por ID
      const products = await this.productService.findsByIds(productIds);

      // Verificamos si hay productos no encontrados
      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map(p => p.id));
        const missingIds = detailBuy
          .filter(item => !foundIds.has(item.productId))
          .map(item => item.productId);

        throw new ConflictException(`Productos con el id: ${missingIds.join(", ")} no encontrados`);
      }

      // Formateamos la lista de productos con sus cantidades
      const formatted = this.formatQuatityProduct(products, detailBuy);

      // Calculamos el nuevo total de la compra
      const newTotal = formatted.reduce(
        (sum, { product, quantity }) => sum + (quantity * product.price),
        0
      );

      // Si el total cambia, guardamos la diferencia para ajustar saldos
      if (newTotal !== buyHistory.total) {
        totalDifference = buyHistory.total - newTotal;
        buyHistory.total = newTotal;
      }

      // Eliminamos los detalles anteriores de la compra
      await manager.delete(BuyHistoryDetalle, { buyHistory: { id: buyHistory.id } });

      // Creamos los nuevos detalles con los productos actualizados
      const newDetails = formatted.map(({ product, quantity }) => ({
        buyHistory,
        product,
        quantity,
      }));

      // Guardamos los nuevos detalles y los asociamos a la compra
      buyHistory.buyHistoryDetalle = await manager.save(BuyHistoryDetalle, newDetails);
    }

    // === AJUSTE DE SALDOS EN CUENTAS ===
    if (oldAccount) {
      // Si se cambió de cuenta, devolvemos el total a la cuenta antigua...
      oldAccount.current_balance += +buyHistory.total;

      // ...y lo descontamos de la nueva cuenta
      buyHistory.banckAccount.current_balance -= buyHistory.total;

      await manager.save(BankAccount, oldAccount);
      await manager.save(BankAccount, buyHistory.banckAccount);
    } else if (totalDifference !== 0) {
      // Si no cambió de cuenta pero cambió el total, solo ajustamos el saldo de la cuenta actual
      buyHistory.banckAccount.current_balance += totalDifference;
      await manager.save(BankAccount, buyHistory.banckAccount);
    }

    // === ACTUALIZACIÓN DE DESCRIPCIÓN ===
    if (description) {
      buyHistory.description = description;
    }

    // Guardamos la entidad de la compra actualizada
    await manager.save(BuyHistory, buyHistory);

    // Retornamos la compra modificada
    return buyHistory;
  });
}

  remove(id: number) {
    return `This action removes a #${id} buyHistory`;
  }

  async createNewHistoryBuy(createBuyHistoryDto:CreateBuyHistoryDto){
      return this.buyHistoryRepository.manager.transaction(async (transactionalEntityManager) => {
        const { bankAcount, description, detailBuy } = createBuyHistoryDto;

        // Validar cuenta bancaria
        const banckAccount = await this.bankAccountService.findOne(bankAcount);
        if (!banckAccount) {
          throw new NotFoundException("Cuenta bancaria no encontrada");
        }

        // Validar productos
        const productIds = detailBuy.map(detail => detail.productId);
        const foundProducts = await this.productService.findsByIds(productIds);

        if (!foundProducts || foundProducts.length !== productIds.length) {
          const foundIds = new Set(foundProducts.map(p => p.id));
          const missingIds = detailBuy
            .filter(item => !foundIds.has(item.productId))
            .map(item => item.productId);

          throw new ConflictException(`Productos con el id: ${missingIds.join(", ")} no encontrados`);
        }

        // Crear BuyHistory
        const buyHistory = transactionalEntityManager.create(BuyHistory, {
         banckAccount: banckAccount,
          date: new Date(),
          description,
          total: 0,
        });

        await transactionalEntityManager.save(BuyHistory, buyHistory);

        let total = 0;

        const formattedProducts = detailBuy.map(detail => {
          const product = foundProducts.find(p => p.id === detail.productId)!;
          total += detail.quantity * product.price;
          return { product, quantity: detail.quantity };
        });

        if((banckAccount.current_balance - total) <= 0){
          throw new ConflictException("Saldo insuficiente LMAO")
        }
        const buyHistoryDetail = formattedProducts.map(({ product, quantity }) =>
          transactionalEntityManager.create(BuyHistoryDetalle, {
            quantity,
            products: product,
            buyHistory,
          })
        );
        buyHistory.buyHistoryDetalle  = await transactionalEntityManager.save(BuyHistoryDetalle, buyHistoryDetail);
        buyHistory.total = total;

        await transactionalEntityManager.save(BuyHistory, buyHistory);


        // actualizar saldo OwO


        buyHistory.banckAccount = await transactionalEntityManager.save(BankAccount, {
          ...banckAccount,
          current_balance: banckAccount.current_balance - total
        });
        return buyHistory;
      });
  }

  formatQuatityProduct(products:Product[], detailBuy:CreateBuyHistoryDetalleDto[]):{product:Product, quantity:number}[]{
    return detailBuy.map(detail => {
          const product = products.find(p => p.id === detail.productId)!;
          return { product, quantity: detail.quantity };
    })
  }
}
