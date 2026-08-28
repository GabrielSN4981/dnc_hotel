import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { REDIS_HOTEL_KEY } from 'src/shared/utils/redisKey';

@Injectable()
export class FindAllHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit;

    const dataRedis = await this.redis.get(REDIS_HOTEL_KEY);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let data = JSON.parse(dataRedis ?? 'null');

    if (!data) {
      data = await this.hotelRepositories.findHotels(offSet, limit);
      await this.redis.set(REDIS_HOTEL_KEY, JSON.stringify(data));
    }

    const total = await this.hotelRepositories.countHotels();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { total, page, per_page: limit, data };
  }
}
