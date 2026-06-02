import { Injectable } from '@nestjs/common';
import { IReservationRepository } from '../domain/repositories/IReservation.repositories';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { Reservation } from 'generated/prisma/client';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  create(data: CreateReservationDto): Promise<Reservation> {
    throw new Error('');
  }
}
