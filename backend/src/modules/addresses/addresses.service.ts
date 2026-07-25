import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.isDefault) {
      await this.unsetDefault(userId);
    }

    const address = this.addressesRepository.create({ ...dto, userId });
    return this.addressesRepository.save(address);
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOneOwned(id: string, userId: string): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    await this.findOneOwned(id, userId);

    if (dto.isDefault) {
      await this.unsetDefault(userId);
    }

    await this.addressesRepository.update({ id, userId }, dto);
    return this.findOneOwned(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOneOwned(id, userId);
    await this.addressesRepository.delete({ id, userId });
  }

  private async unsetDefault(userId: string): Promise<void> {
    await this.addressesRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}
