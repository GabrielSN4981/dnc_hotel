import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Role } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Redis } from 'ioredis';
import request from 'supertest';
import { CreateHotelDto } from 'src/modules/hotels/domain/dto/createHotel.dto';
import { UpdateHotelDto } from 'src/modules/hotels/domain/dto/updateHotel.dto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

jest.mock('ioredis', () => {
  const moduleRedis = jest.fn().mockImplementation(() => ({
    del: jest.fn<() => Promise<number>>().mockResolvedValue(1),
    get: jest
      .fn<() => Promise<string>>()
      .mockResolvedValue(JSON.stringify([{ key: 'mock-value' }])),
    quit: jest.fn<() => Promise<null>>().mockResolvedValue(null),
  }));
  return { __esModule: true, default: moduleRedis, Redis: moduleRedis };
});

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let redisClient: Redis;
  let hotelId: number;
  let adminUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisClient = new Redis();
    prisma = app.get(PrismaService);

    await app.init();

    await prisma.reservation.deleteMany({});
    await prisma.hotel.deleteMany({});
    await prisma.user.deleteMany({});

    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: Role.ADMIN,
      },
    });

    adminUserId = adminUser.id;

    const normalUser = await prisma.user.create({
      data: {
        name: 'User',
        email: 'user@gmail.com',
        password: 'user123',
        role: Role.USER,
      },
    });

    adminToken = jwt.sign(
      { sub: adminUser.id, role: Role.ADMIN },
      process.env.JWT_SECRET!,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );

    userToken = jwt.sign(
      { sub: normalUser.id, role: Role.USER },
      process.env.JWT_SECRET!,
      { expiresIn: '1h', issuer: 'dnc_hotel', audience: 'users' },
    );
  });

  afterAll(async () => {
    await prisma.reservation.deleteMany({});
    await prisma.hotel.deleteMany({});
    await prisma.user.deleteMany({});

    await redisClient.quit();
    await app.close();
  });

  it('/hotels (POST)', async () => {
    const createHotelDto: CreateHotelDto = {
      name: 'Test Hotel',
      description: 'Test Description',
      price: 100,
      address: '123 Test St',
      image: 'image.jpg',
      ownerId: adminUserId,
    };

    const response = await request(app.getHttpServer())
      .post('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createHotelDto)
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    hotelId = response.body.id;

    expect(response.body).toMatchObject({
      name: createHotelDto.name,
      description: createHotelDto.description,
      price: createHotelDto.price,
      address: createHotelDto.address,
    });
  });

  it('/hotels (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/hotels')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(1);
  });

  it('/hotels/:id (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: hotelId,
      name: 'Test Hotel',
    });
  });

  it('/hotels/:id (PATCH)', async () => {
    const updateHotelDto: UpdateHotelDto = {
      name: 'Updated Hotel',
    };

    const response = await request(app.getHttpServer())
      .patch(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateHotelDto)
      .expect(200);

    expect(response.body).toMatchObject({
      name: updateHotelDto.name,
    });
  });

  it('/hotels/image/:hotelId (PATCH)', async () => {
    await mkdir(join(process.cwd(), 'uploads-hotel'), { recursive: true });

    await writeFile(
      join(process.cwd(), 'uploads-hotel', 'image.jpg'),
      'old-image',
    );

    await request(app.getHttpServer())
      .patch(`/hotels/image/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('mock-file-content'), 'mock-file.jpg')
      .expect(200);
  });

  it('/hotels/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
