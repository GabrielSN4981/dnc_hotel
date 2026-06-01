import { Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from '../domain/dto/createHotel.dto';
import { HOTEL_REPOSITORY_TOKEN } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/IHotel.repositories';

@Injectable()
export class CreateHotelService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
  ) {}

  async execute(createHotelDto: CreateHotelDto, id: number) {
    return await this.hotelRepositories.createHotel(createHotelDto, id);
  }
}
