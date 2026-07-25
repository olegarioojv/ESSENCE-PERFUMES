import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CountStockDto } from './dto/count-stock.dto';
import { FindStockMovementsDto } from './dto/find-stock-movements.dto';
import { StockQuantityDto } from './dto/stock-quantity.dto';
import { UpdateStockSettingsDto } from './dto/update-stock-settings.dto';
import { StockMovementType } from './entities/stock-movement-type.enum';
import { StockMovement } from './entities/stock-movement.entity';
import { Stock } from './entities/stock.entity';

export interface PaginatedStockMovements {
  items: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly stockMovementsRepository: Repository<StockMovement>,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(): Promise<Stock[]> {
    return this.stockRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async findByProduct(productId: string): Promise<Stock> {
    await this.productsService.findById(productId);
    return this.getOrCreate(productId);
  }

  async findLowStock(): Promise<Stock[]> {
    return this.stockRepository
      .createQueryBuilder('stock')
      .where('stock.quantity - stock.reservedQuantity <= stock.minQuantity')
      .orderBy('stock.updatedAt', 'DESC')
      .getMany();
  }

  async findMovements(
    filters: FindStockMovementsDto = {},
  ): Promise<PaginatedStockMovements> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;

    const where: Partial<Pick<StockMovement, 'productId' | 'type'>> = {};
    if (filters.productId) {
      where.productId = filters.productId;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    const [items, total] = await this.stockMovementsRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async stockIn(
    productId: string,
    dto: StockQuantityDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    const previousQuantity = stock.quantity;
    const newQuantity = previousQuantity + dto.quantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.ENTRADA,
      quantity: dto.quantity,
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update({ productId }, { quantity: newQuantity });
    return this.getOrCreate(productId);
  }

  async stockOut(
    productId: string,
    dto: StockQuantityDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    const available = stock.quantity - stock.reservedQuantity;
    if (dto.quantity > available) {
      throw new BadRequestException(
        'Quantidade indisponível em estoque para saída',
      );
    }

    const previousQuantity = stock.quantity;
    const newQuantity = previousQuantity - dto.quantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.SAIDA,
      quantity: dto.quantity,
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update({ productId }, { quantity: newQuantity });
    return this.getOrCreate(productId);
  }

  async adjust(
    productId: string,
    dto: AdjustStockDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    const previousQuantity = stock.quantity;
    const newQuantity = dto.quantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.AJUSTE,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update({ productId }, { quantity: newQuantity });
    return this.getOrCreate(productId);
  }

  async count(
    productId: string,
    dto: CountStockDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    const previousQuantity = stock.quantity;
    const newQuantity = dto.countedQuantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.CONTAGEM,
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update({ productId }, { quantity: newQuantity });
    return this.getOrCreate(productId);
  }

  async reserve(
    productId: string,
    dto: StockQuantityDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    const available = stock.quantity - stock.reservedQuantity;
    if (dto.quantity > available) {
      throw new BadRequestException(
        'Quantidade indisponível em estoque para reserva',
      );
    }

    const previousQuantity = stock.reservedQuantity;
    const newQuantity = previousQuantity + dto.quantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.RESERVA,
      quantity: dto.quantity,
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update(
      { productId },
      { reservedQuantity: newQuantity },
    );
    return this.getOrCreate(productId);
  }

  async release(
    productId: string,
    dto: StockQuantityDto,
    actorId: string,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    const stock = await this.getOrCreate(productId);

    if (dto.quantity > stock.reservedQuantity) {
      throw new BadRequestException(
        'Quantidade de liberação maior que a reservada',
      );
    }

    const previousQuantity = stock.reservedQuantity;
    const newQuantity = previousQuantity - dto.quantity;

    await this.recordMovement({
      productId,
      type: StockMovementType.LIBERACAO_RESERVA,
      quantity: dto.quantity,
      previousQuantity,
      newQuantity,
      reason: dto.reason ?? null,
      actorId,
    });

    await this.stockRepository.update(
      { productId },
      { reservedQuantity: newQuantity },
    );
    return this.getOrCreate(productId);
  }

  async updateSettings(
    productId: string,
    dto: UpdateStockSettingsDto,
  ): Promise<Stock> {
    await this.productsService.findById(productId);
    await this.getOrCreate(productId);
    await this.stockRepository.update(
      { productId },
      { minQuantity: dto.minQuantity },
    );
    return this.getOrCreate(productId);
  }

  private async getOrCreate(productId: string): Promise<Stock> {
    const existing = await this.stockRepository.findOne({
      where: { productId },
    });
    if (existing) {
      return existing;
    }

    const stock = this.stockRepository.create({
      productId,
      quantity: 0,
      reservedQuantity: 0,
      minQuantity: 0,
    });
    return this.stockRepository.save(stock);
  }

  private async recordMovement(data: {
    productId: string;
    type: StockMovementType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string | null;
    actorId: string;
  }): Promise<StockMovement> {
    const movement = this.stockMovementsRepository.create(data);
    return this.stockMovementsRepository.save(movement);
  }
}
