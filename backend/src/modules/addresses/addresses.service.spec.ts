import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';

function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 'addr-1',
    userId: 'user-1',
    label: 'Casa',
    recipientName: 'Maria Silva',
    phone: '11999999999',
    zipCode: '01310-000',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AddressesService', () => {
  let service: AddressesService;
  let repository: jest.Mocked<
    Pick<
      Repository<Address>,
      'create' | 'save' | 'find' | 'findOne' | 'update' | 'delete'
    >
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn((data) => data as Address),
      save: jest.fn((entity) => Promise.resolve(entity as Address)),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: getRepositoryToken(Address), useValue: repository },
      ],
    }).compile();

    service = module.get(AddressesService);
  });

  describe('create', () => {
    it('creates an address scoped to the user', async () => {
      const address = await service.create('user-1', {
        label: 'Casa',
        recipientName: 'Maria Silva',
        phone: '11999999999',
        zipCode: '01310-000',
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      });

      expect(address.userId).toBe('user-1');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('unsets the previous default address when creating a new default one', async () => {
      await service.create('user-1', {
        label: 'Casa',
        recipientName: 'Maria Silva',
        phone: '11999999999',
        zipCode: '01310-000',
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        isDefault: true,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { userId: 'user-1', isDefault: true },
        { isDefault: false },
      );
    });
  });

  describe('findOneOwned', () => {
    it('throws NotFoundException when the address does not belong to the user', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneOwned('addr-1', 'someone-else'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the address when owned by the user', async () => {
      const address = buildAddress();
      repository.findOne.mockResolvedValue(address);

      const result = await service.findOneOwned('addr-1', 'user-1');

      expect(result).toBe(address);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException instead of deleting when not owned', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('addr-1', 'someone-else')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('deletes the address when owned by the user', async () => {
      repository.findOne.mockResolvedValue(buildAddress());

      await service.remove('addr-1', 'user-1');

      expect(repository.delete).toHaveBeenCalledWith({
        id: 'addr-1',
        userId: 'user-1',
      });
    });
  });
});
