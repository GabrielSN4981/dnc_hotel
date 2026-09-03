import { Test, TestingModule } from '@nestjs/testing';
import { CreateHotelService } from './createHotel.service';
import { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import { REDIS_HOTEL_KEY } from '../../../shared/utils/redisKey';

let service: CreateHotelService;
let hotelRepository: IHotelRepository;
let redis: {
  del: jest.MockedFunction<(key: string) => Promise<number | null>>;
};

const createHotelMock = {
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

const userIdMock = 1;

describe('CreateHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHotelService,
        {
          provide: HOTEL_REPOSITORY_TOKEN,
          useValue: {
            createHotel: jest
              .fn<IHotelRepository['createHotel']>()
              .mockResolvedValue(createHotelMock),
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

    service = module.get<CreateHotelService>(CreateHotelService);
    hotelRepository = module.get<IHotelRepository>(HOTEL_REPOSITORY_TOKEN);
    redis = module.get('default_IORedisModuleConnectionToken');
  });
  it('should be', () => {
    expect(service).toBeDefined();
  });

  it('should delete the redis key', async () => {
    const redisDelSpy = jest.spyOn(redis, 'del').mockResolvedValue(1);

    await service.execute(createHotelMock, userIdMock);

    expect(redisDelSpy).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  });

  it('should create a hotel', async () => {
    /* const createHotelSpy = jest
      .spyOn(hotelRepository, 'createHotel')
      .mockResolvedValue(createHotelMock); */

    const result = await service.execute(createHotelMock, userIdMock);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(hotelRepository.createHotel).toHaveBeenCalledWith(
      createHotelMock,
      userIdMock,
    );

    expect(result).toEqual(createHotelMock);
  });
});
