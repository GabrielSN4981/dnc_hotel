import { Reservation } from 'generated/prisma/client';
import { CreateReservationDto } from '../dto/create-reservation.dto';

export interface IReservationRepository {
  create(data: CreateReservationDto): Promise<Reservation>;
  findAll(): Promise<Reservation[]>;
  findById(id: number): Promise<Reservation>;
  findByUser(userId: number): Promise<Reservation[]>;
}
