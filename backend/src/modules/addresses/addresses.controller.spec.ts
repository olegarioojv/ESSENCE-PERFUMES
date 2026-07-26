import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';
import { Role } from '../users/entities/role.enum';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 'address-1',
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

const currentUser: JwtPayload = {
  sub: 'user-1',
  email: 'maria@example.com',
  role: Role.CLIENTE,
};

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: jest.Mocked<
    Pick<
      AddressesService,
      'findAllByUser' | 'findOneOwned' | 'create' | 'update' | 'remove'
    >
  >;

  beforeEach(async () => {
    service = {
      findAllByUser: jest.fn(),
      findOneOwned: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: service }],
    }).compile();

    controller = module.get(AddressesController);
  });

  it('findAll delegates to the service with the user id', async () => {
    const addresses = [buildAddress()];
    service.findAllByUser.mockResolvedValue(addresses);

    await expect(controller.findAll(currentUser)).resolves.toBe(addresses);
    expect(service.findAllByUser).toHaveBeenCalledWith('user-1');
  });

  it('findOne delegates to the service with the user id and address id', async () => {
    const address = buildAddress();
    service.findOneOwned.mockResolvedValue(address);

    await expect(controller.findOne(currentUser, 'address-1')).resolves.toBe(
      address,
    );
    expect(service.findOneOwned).toHaveBeenCalledWith(
      'address-1',
      'user-1',
    );
  });

  it('create delegates to the service with the user id and dto', async () => {
    const dto = {
      label: 'Casa',
      recipientName: 'Maria Silva',
      phone: '11999999999',
      zipCode: '01310-000',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    };
    const address = buildAddress();
    service.create.mockResolvedValue(address);

    await expect(controller.create(currentUser, dto)).resolves.toBe(address);
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('update delegates to the service with the user id, address id and dto', async () => {
    const dto = { label: 'Trabalho' };
    const address = buildAddress({ label: dto.label });
    service.update.mockResolvedValue(address);

    await expect(
      controller.update(currentUser, 'address-1', dto),
    ).resolves.toBe(address);
    expect(service.update).toHaveBeenCalledWith('address-1', 'user-1', dto);
  });

  it('remove delegates to the service with the user id and address id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(currentUser, 'address-1');

    expect(service.remove).toHaveBeenCalledWith('address-1', 'user-1');
  });
});
