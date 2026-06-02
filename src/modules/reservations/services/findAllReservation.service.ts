import { Inject, Injectable } from '@nestjs/common';
import { RESERVATION_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import type { IReservationRepository } from '../domain/repositories/IReservation.repositories';

@Injectable()
export class FindAllReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepositories: IReservationRepository,
  ) {}

  async execute() {
    return await this.reservationRepositories.findAll();
  }
}
