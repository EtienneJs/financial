import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class BuyHistoryService {
  constructor(
    @InjectRepository(BuyHistory)
    private readonly buyHistoryRepository: Repository<BuyHistory>,
    @InjectRepository(BuyHistoryDetalle)
    private readonly bankAccountService: BankAccountService,
    private readonly productService: ProductService,
  ) {}

  findAll(user: User) {
    return this.buyHistoryRepository.find({
      where: { user: { id: user.id } },
      relations: ['banckAccount', 'buyHistoryDetalle', 'buyHistoryDetalle.products'],
    });
  }

  async findOne(id: string, user: User): Promise<BuyHistory> {
    const findBuyHistory = await this.buyHistoryRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['banckAccount', 'buyHistoryDetalle', 'buyHistoryDetalle.products'],
    });
    
    if (!findBuyHistory) {
      throw new NotFoundException("History not found");
    }
    
    return findBuyHistory;
  }

  async update(id: string, updateBuyHistoryDto: UpdateBuyHistoryDto, user: User) {
    return await this.buyHistoryRepository.manager.transaction(async (manager) => {
      const { bankAcount, description, detailBuy } = updateBuyHistoryDto;

      // Buscar la compra existente
      const buyHistory = await this.findBuyHistoryWithRelations(manager, id, user);
      
      // Manejar cambio de cuenta bancaria
      const { oldAccount, totalDifference } = await this.handleBankAccountChange(
        manager, 
        buyHistory, 
        bankAcount
      );

      // Actualizar productos si se proporcionan
      if (detailBuy) {
        await this.updatePurchaseDetails(manager, buyHistory, detailBuy);
      }

      // Ajustar saldos en cuentas
      await this.adjustAccountBalances(
        manager, 
        buyHistory, 
        oldAccount, 
        totalDifference
      );

      // Actualizar descripción si se proporciona
      if (description) {
        buyHistory.description = description;
      }

      // Guardar la compra actualizada
      return await manager.save(BuyHistory, buyHistory);
    });
  }

  remove(id: number) {
    return `This action removes a #${id} buyHistory`;
  }

  async createNewHistoryBuy(createBuyHistoryDto: CreateBuyHistoryDto, user: User) {
    return await this.buyHistoryRepository.manager.transaction(async (transactionalEntityManager) => {
      const { bankAcount, description, detailBuy } = createBuyHistoryDto;

      // Validar cuenta bancaria y que pertenezca al usuario
      const bankAccount = await this.bankAccountService.findOne(bankAcount);
      if (!bankAccount) {
        throw new NotFoundException("Cuenta bancaria no encontrada");
      }

      // Verificar que la cuenta bancaria pertenezca al usuario
      if (bankAccount.bank.user.id !== user.id) {
        throw new ForbiddenException("La cuenta bancaria no pertenece al usuario");
      }

      // Validar productos
      const foundProducts = await this.validateAndGetProducts(detailBuy);

      // Crear la compra
      const buyHistory = await this.createBuyHistory(
        transactionalEntityManager, 
        bankAccount, 
        description,
        user
      );

      // Procesar productos y calcular total
      const { formattedProducts, total } = this.processProductsAndCalculateTotal(
        detailBuy, 
        foundProducts
      );

      // Verificar saldo suficiente
      this.validateSufficientBalance(bankAccount, total);

      // Crear detalles de la compra
      await this.createBuyHistoryDetails(
        transactionalEntityManager, 
        buyHistory, 
        formattedProducts
      );

      // Actualizar total y guardar
      buyHistory.total = total;
      await transactionalEntityManager.save(BuyHistory, buyHistory);

      // Actualizar saldo de la cuenta bancaria
      buyHistory.banckAccount = await this.updateBankAccountBalance(
        transactionalEntityManager, 
        bankAccount, 
        total
      );

      return buyHistory;
    });
  }

  // Métodos privados para mejorar legibilidad

  private async findBuyHistoryWithRelations(manager: any, id: string, user: User): Promise<BuyHistory> {
    const buyHistory = await manager.findOne(BuyHistory, {
      where: { id, user: { id: user.id } },
      relations: ['banckAccount', 'user'],
    });

    if (!buyHistory) {
      throw new NotFoundException('Compra no encontrada');
    }

    return buyHistory;
  }

  private async handleBankAccountChange(
    manager: any, 
    buyHistory: BuyHistory, 
    newBankAccountId?: string
  ): Promise<{ oldAccount: BankAccount | null; totalDifference: number }> {
    let oldAccount: BankAccount | null = null;
    let totalDifference = 0;

    if (newBankAccountId) {
      const newAccount = await this.bankAccountService.findOne(newBankAccountId);
      if (newAccount.id !== buyHistory.banckAccount.id) {
        oldAccount = buyHistory.banckAccount;
        buyHistory.banckAccount = newAccount;
      }
    }

    return { oldAccount, totalDifference };
  }

  private async updatePurchaseDetails(
    manager: any, 
    buyHistory: BuyHistory, 
    detailBuy: CreateBuyHistoryDetalleDto[]
  ): Promise<void> {
    // Validar que no venga vacío
    if (!detailBuy.length) {
      throw new ConflictException("El detalle de compra no puede estar vacío");
    }

    // Obtener productos
    const productIds = detailBuy.map(d => d.productId);
    const products = await this.productService.findsByIds(productIds);

    // Verificar productos encontrados
    this.validateAllProductsFound(products, productIds);

    // Formatear productos y calcular nuevo total
    const formatted = this.formatQuantityProduct(products, detailBuy);
    const newTotal = this.calculateTotalFromProducts(formatted);

    // Actualizar total si cambió
    if (newTotal !== buyHistory.total) {
      buyHistory.total = newTotal;
    }

    // Eliminar detalles anteriores y crear nuevos
    await manager.delete(BuyHistoryDetalle, { buyHistory: { id: buyHistory.id } });
    
    const newDetails = formatted.map(({ product, quantity }) => ({
      buyHistory,
      product,
      quantity,
    }));

    buyHistory.buyHistoryDetalle = await manager.save(BuyHistoryDetalle, newDetails);
  }

  private async adjustAccountBalances(
    manager: any, 
    buyHistory: BuyHistory, 
    oldAccount: BankAccount | null, 
    totalDifference: number
  ): Promise<void> {
    if (oldAccount) {
      // Si se cambió de cuenta, devolver total a cuenta antigua y descontar de nueva
      oldAccount.current_balance += +buyHistory.total;
      buyHistory.banckAccount.current_balance -= buyHistory.total;

      await manager.save(BankAccount, oldAccount);
      await manager.save(BankAccount, buyHistory.banckAccount);
    } else if (totalDifference !== 0) {
      // Si no cambió de cuenta pero cambió el total, ajustar saldo
      buyHistory.banckAccount.current_balance += totalDifference;
      await manager.save(BankAccount, buyHistory.banckAccount);
    }
  }

  private async validateAndGetProducts(detailBuy: CreateBuyHistoryDetalleDto[]): Promise<Product[]> {
    const productIds = detailBuy.map(detail => detail.productId);
    const foundProducts = await this.productService.findsByIds(productIds);

    if (!foundProducts || foundProducts.length !== productIds.length) {
      const foundIds = new Set(foundProducts.map(p => p.id));
      const missingIds = detailBuy
        .filter(item => !foundIds.has(item.productId))
        .map(item => item.productId);

      throw new ConflictException(`Productos con el id: ${missingIds.join(", ")} no encontrados`);
    }

    return foundProducts;
  }

  private async createBuyHistory(
    manager: any, 
    bankAccount: BankAccount, 
    description: string,
    user: User
  ): Promise<BuyHistory> {
    const buyHistory = manager.create(BuyHistory, {
      banckAccount: bankAccount,
      date: new Date(),
      description,
      total: 0,
      user: user,
    });

    return await manager.save(BuyHistory, buyHistory);
  }

  private processProductsAndCalculateTotal(
    detailBuy: CreateBuyHistoryDetalleDto[], 
    foundProducts: Product[]
  ): { formattedProducts: { product: Product; quantity: number }[]; total: number } {
    let total = 0;

    const formattedProducts = detailBuy.map(detail => {
      const product = foundProducts.find(p => p.id === detail.productId)!;
      total += detail.quantity * product.price;
      return { product, quantity: detail.quantity };
    });

    return { formattedProducts, total };
  }

  private validateSufficientBalance(bankAccount: BankAccount, total: number): void {
    if ((bankAccount.current_balance - total) <= 0) {
      throw new ConflictException("Saldo insuficiente LMAO");
    }
  }

  private async createBuyHistoryDetails(
    manager: any, 
    buyHistory: BuyHistory, 
    formattedProducts: { product: Product; quantity: number }[]
  ): Promise<void> {
    const buyHistoryDetail = formattedProducts.map(({ product, quantity }) =>
      manager.create(BuyHistoryDetalle, {
        quantity,
        products: product,
        buyHistory,
      })
    );

    buyHistory.buyHistoryDetalle = await manager.save(BuyHistoryDetalle, buyHistoryDetail);
  }

  private async updateBankAccountBalance(
    manager: any, 
    bankAccount: BankAccount, 
    total: number
  ): Promise<BankAccount> {
    return await manager.save(BankAccount, {
      ...bankAccount,
      current_balance: bankAccount.current_balance - total
    });
  }

  private validateAllProductsFound(products: Product[], productIds: string[]): void {
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map(p => p.id));
      const missingIds = productIds.filter(id => !foundIds.has(id));
      throw new ConflictException(`Productos con el id: ${missingIds.join(", ")} no encontrados`);
    }
  }

  private calculateTotalFromProducts(
    formattedProducts: { product: Product; quantity: number }[]
  ): number {
    return formattedProducts.reduce(
      (sum, { product, quantity }) => sum + (quantity * product.price),
      0
    );
  }

  formatQuantityProduct(
    products: Product[], 
    detailBuy: CreateBuyHistoryDetalleDto[]
  ): { product: Product; quantity: number }[] {
    return detailBuy.map(detail => {
      const product = products.find(p => p.id === detail.productId)!;
      return { product, quantity: detail.quantity };
    });
  }
}
