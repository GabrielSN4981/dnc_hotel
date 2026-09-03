import { Test, TestingModule } from '@nestjs/testing';
import { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { UploadImageHotelService } from './uploadImageHotel.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import { REDIS_HOTEL_KEY } from '../../../shared/utils/redisKey';
import { NotFoundException } from '@nestjs/common';
import { stat, unlink } from 'fs/promises';
import { resolve, join } from 'path';

let service: UploadImageHotelService;
let hotelRepository: IHotelRepository;
let redis: {
  del: jest.MockedFunction<(key: string) => Promise<number | null>>;
};

const hotelMock = {
  id: 1,
  name: 'Hotel Test',
  description: 'Hotel Test Description',
  image: 'test-image.jpg',
  price: 100,
  address: 'Hotel Test Address',
  ownerId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const IdAndImageMock = { userId: '1', image: 'test-image.jpg' };

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  unlink: jest.fn(),
}));

describe('UploadImageHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadImageHotelService,
        {
          provide: HOTEL_REPOSITORY_TOKEN,
          useValue: {
            findHotelById: jest
              .fn<IHotelRepository['findHotelById']>()
              .mockResolvedValue(hotelMock),
            updateHotel: jest
              .fn<IHotelRepository['updateHotel']>()
              .mockResolvedValue(hotelMock),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            del: jest.fn<IHotelRepository['deleteHotel']>(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadImageHotelService>(UploadImageHotelService);
    hotelRepository = module.get<IHotelRepository>(HOTEL_REPOSITORY_TOKEN);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if hotel not found', async () => {
    (
      hotelRepository.findHotelById as jest.MockedFunction<
        IHotelRepository['findHotelById']
      >
    ).mockResolvedValueOnce(
      null as Awaited<ReturnType<IHotelRepository['findHotelById']>>,
    );

    const result = service.execute(IdAndImageMock.userId, IdAndImageMock.image);

    await expect(result).rejects.toThrow(NotFoundException);
  });

  it('should delete existing image if it exists', async () => {
    (stat as jest.MockedFunction<typeof stat>).mockResolvedValueOnce(
      true as unknown as Awaited<ReturnType<typeof stat>>,
    );

    await service.execute(IdAndImageMock.userId, IdAndImageMock.image);

    const directory = resolve(process.cwd(), 'uploads-hotel');

    const imageHotelFilePath = join(directory, hotelMock.image);

    expect(stat).toHaveBeenCalledWith(imageHotelFilePath);
    expect(unlink).toHaveBeenCalledWith(imageHotelFilePath);
  });

  it('should not throw if existing image does not exist', async () => {
    (stat as jest.MockedFunction<typeof stat>).mockResolvedValueOnce(
      true as unknown as Awaited<ReturnType<typeof stat>>,
    );

    const result = service.execute(IdAndImageMock.userId, IdAndImageMock.image);

    await expect(result).resolves.not.toThrow();
  });

  it('should update the hotel with the new image', async () => {
    (stat as jest.MockedFunction<typeof stat>).mockResolvedValueOnce(
      true as unknown as Awaited<ReturnType<typeof stat>>,
    );

    await service.execute(IdAndImageMock.userId, 'new-image.jpg');
    /* eslint-disable @typescript-eslint/unbound-method */
    expect(hotelRepository.updateHotel).toHaveBeenCalledWith(1, {
      image: 'new-image.jpg',
    });
  });

  it('should delete the Redis cache key', async () => {
    await service.execute(IdAndImageMock.userId, 'new-image.jpg');
    expect(redis.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  });
});
