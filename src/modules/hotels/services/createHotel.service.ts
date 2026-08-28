import { Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from '../domain/dto/createHotel.dto';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { REDIS_HOTEL_KEY } from 'src/shared/utils/redisKey';

@Injectable()
export class CreateHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async execute(createHotelDto: CreateHotelDto, id: number) {
    await this.redis.del(REDIS_HOTEL_KEY);
    return await this.hotelRepositories.createHotel(createHotelDto, id);
  }
}
