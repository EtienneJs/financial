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

  findOne(id: number) {
    return `This action returns a #${id} buyHistory`;
  }

  update(id: number, updateBuyHistoryDto: UpdateBuyHistoryDto) {
    return `This action updates a #${id} buyHistory`;
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
}
