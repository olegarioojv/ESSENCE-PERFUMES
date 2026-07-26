import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { Address } from './../src/modules/addresses/entities/address.entity';
import { User } from './../src/modules/users/entities/user.entity';

describe('Addresses (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;
  let addressesRepository: Repository<Address>;

  const suffix = Date.now();
  const email = `addresses-e2e-${suffix}@example.com`;
  const otherEmail = `addresses-e2e-other-${suffix}@example.com`;
  const password = 'Senha123';

  let userId: string;
  let accessToken: string;
  let otherUserId: string;
  let otherAccessToken: string;
  let addressId: string;

  const baseAddress = {
    label: 'Casa',
    recipientName: 'Maria Silva',
    phone: '11999999999',
    zipCode: '01310-000',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apto 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(User));
    addressesRepository = moduleFixture.get(getRepositoryToken(Address));

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Addresses E2E', email, password })
      .expect(201);
    userId = registerResponse.body.user.id;
    accessToken = registerResponse.body.accessToken;

    const otherRegisterResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Addresses E2E Other', email: otherEmail, password })
      .expect(201);
    otherUserId = otherRegisterResponse.body.user.id;
    otherAccessToken = otherRegisterResponse.body.accessToken;
  });

  afterAll(async () => {
    if (userId) {
      await addressesRepository.delete({ userId });
    }
    if (otherUserId) {
      await addressesRepository.delete({ userId: otherUserId });
    }
    if (userId) {
      await usersRepository.delete({ id: userId });
    }
    if (otherUserId) {
      await usersRepository.delete({ id: otherUserId });
    }
    await app.close();
  });

  it('rejects unauthenticated requests with 401', async () => {
    await request(app.getHttpServer()).get('/addresses').expect(401);
    await request(app.getHttpServer())
      .post('/addresses')
      .send(baseAddress)
      .expect(401);
  });

  it('creates an address for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(baseAddress)
      .expect(201);

    expect(response.body.userId).toBe(userId);
    expect(response.body.street).toBe(baseAddress.street);
    expect(response.body.city).toBe(baseAddress.city);

    addressId = response.body.id;
  });

  it('lists only the current user addresses', async () => {
    const response = await request(app.getHttpServer())
      .get('/addresses')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((a: { id: string }) => a.id === addressId)).toBe(
      true,
    );

    const otherResponse = await request(app.getHttpServer())
      .get('/addresses')
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(200);

    expect(
      otherResponse.body.some((a: { id: string }) => a.id === addressId),
    ).toBe(false);
  });

  it('updates the address', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/addresses/${addressId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ city: 'Campinas', number: '2000' })
      .expect(200);

    expect(response.body.city).toBe('Campinas');
    expect(response.body.number).toBe('2000');
  });

  it('prevents a different user from updating another user address (404)', async () => {
    // AddressesService.update calls findOneOwned({id, userId}) first, which
    // throws NotFoundException when the address does not belong to the caller.
    await request(app.getHttpServer())
      .patch(`/addresses/${addressId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({ city: 'Rio de Janeiro' })
      .expect(404);
  });

  it('prevents a different user from deleting another user address (404)', async () => {
    await request(app.getHttpServer())
      .delete(`/addresses/${addressId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(404);
  });

  it('removes the address', async () => {
    await request(app.getHttpServer())
      .delete(`/addresses/${addressId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/addresses/${addressId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    addressId = '';
  });
});
