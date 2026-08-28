import { Test, TestingModule } from '@nestjs/testing';
import { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { FindAllHotelService } from './findAllHotel.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import { Hotel } from 'generated/prisma/client';

let service: FindAllHotelService;
let hotelRepository: IHotelRepository;

const hotelMock: Hotel = {
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

describe('FindAllHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllHotelService,
        {
          provide: HOTEL_REPOSITORY_TOKEN,
          useValue: {
            findlHotels: jest.fn().mockResolvedValue([hotelMock]),
            countHotels: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<FindAllHotelService>(FindAllHotelService);
    hotelRepository = module.get<IHotelRepository>(HOTEL_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct pagination metadata', async () => {
    const page = 1;
    const limit = 5;
    const result = await service.execute(page, limit);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(hotelRepository.findHotels).toHaveBeenCalledWith(1, 5);
    expect(result.page).toEqual(page);
    expect(result.per_page).toEqual(limit);
  });
});
