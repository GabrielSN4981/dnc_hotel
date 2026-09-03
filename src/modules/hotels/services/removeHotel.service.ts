import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { REDIS_HOTEL_KEY } from '../../../shared/utils/redisKey';

@Injectable()
export class RemoveHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async execute(id: number) {
    await this.redis.del(REDIS_HOTEL_KEY);
    return await this.hotelRepositories.deleteHotel(id);
  }
}
