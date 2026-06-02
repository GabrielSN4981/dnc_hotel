import { Inject, Injectable } from '@nestjs/common';
import { RESERVATION_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import type { IReservationRepository } from '../domain/repositories/IReservation.repositories';
import { ReservationStatus } from 'generated/prisma/client';

@Injectable()
export class UpdateStatusReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepositories: IReservationRepository,
  ) {}

  async execute(id: number, status: ReservationStatus) {
    return this.reservationRepositories.updateStatus(id, status);
  }
}
