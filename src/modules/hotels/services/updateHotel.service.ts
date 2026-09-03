import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_REPOSITORY_TOKEN } from '../../../shared/utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { UpdateHotelDto } from '../domain/dto/updateHotel.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { REDIS_HOTEL_KEY } from '../../../shared/utils/redisKey';

@Injectable()
export class UpdateHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async execute(id: number, data: UpdateHotelDto) {
    await this.redis.del(REDIS_HOTEL_KEY);
    return await this.hotelRepositories.updateHotel(id, data);
  }
}
