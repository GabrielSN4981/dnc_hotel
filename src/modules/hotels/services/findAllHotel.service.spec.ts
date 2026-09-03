/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { FindAllHotelService } from './findAllHotel.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import { Hotel } from 'generated/prisma/client';
import { REDIS_HOTEL_KEY } from '../../../shared/utils/redisKey';

let service: FindAllHotelService;
let hotelRepository: jest.Mocked<IHotelRepository>;
let redis: {
  get: jest.MockedFunction<(key: string) => Promise<string | null>>;
  set: jest.MockedFunction<(key: string, value: string) => Promise<void>>;
};

const hotelMock: Hotel = {
  id: 1,
  name: 'Hotel Test',
  description: 'Hotel Test Description',
  image: 'test-image.jpg',
  price: 100,
  address: 'Hotel Test Address',
  ownerId: 1,
  createdAt: new Date('2026-01-01T00:41:00.000Z'),
  updatedAt: new Date('2026-01-01T00:41:00.000Z'),
};

describe('FindAllHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllHotelService,
        {
          provide: HOTEL_REPOSITORY_TOKEN,
          useValue: {
            findHotels: jest
              .fn<IHotelRepository['findHotels']>()
              .mockResolvedValue([hotelMock]),
            countHotels: jest
              .fn<IHotelRepository['countHotels']>()
              .mockResolvedValue(1),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FindAllHotelService>(FindAllHotelService);
    hotelRepository = module.get<jest.Mocked<IHotelRepository>>(
      HOTEL_REPOSITORY_TOKEN,
    );
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hotels from Redis if available', async () => {
    const hotelsFromRedis = [hotelMock];
    redis.get.mockResolvedValue(JSON.stringify(hotelsFromRedis));

    const result = await service.execute();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    result.data.forEach((hotel) => {
      hotel.createdAt = new Date(hotel.createdAt);
      hotel.updatedAt = new Date(hotel.updatedAt);
    });
    expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    expect(result.data).toEqual(hotelsFromRedis);
  });

  it('should fetch hotels from repository if not in Redis and cache them', async () => {
    redis.get.mockResolvedValue(null);

    const result = await service.execute();

    expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    expect(hotelRepository.findHotels).toHaveBeenCalledWith(0, 10);
    expect(hotelRepository.countHotels).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalledWith(
      REDIS_HOTEL_KEY,
      JSON.stringify([hotelMock]),
    );
    expect(result.data).toEqual([hotelMock]);
    expect(result.total).toEqual(1);
    expect(result).toEqual({
      total: 1,
      page: 1,
      per_page: 10,
      data: [hotelMock],
    });
  });

  it('should return the correct pagination metadata', async () => {
    redis.get.mockResolvedValue(null);

    const page = 2;
    const limit = 5;
    const result = await service.execute(page, limit);

    expect(hotelRepository.findHotels).toHaveBeenCalledWith(5, 5);
    expect(result.page).toEqual(page);
    expect(result.per_page).toEqual(limit);
  });
});
