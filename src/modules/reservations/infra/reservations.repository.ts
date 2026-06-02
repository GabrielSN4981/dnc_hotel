import { Injectable } from '@nestjs/common';
import { IReservationRepository } from '../domain/repositories/IReservation.repositories';
import { Reservation, ReservationStatus } from 'generated/prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: any): Promise<Reservation> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.reservation.create({ data });
  }

  findAll(): Promise<Reservation[]> {
    return this.prisma.reservation.findMany();
  }

  findById(id: number): Promise<Reservation> {
    return this.prisma.reservation.findUniqueOrThrow({ where: { id } });
  }

  findByUser(userId: number): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({ where: { userId } });
  }

  updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    return this.prisma.reservation.update({ where: { id }, data: { status } });
  }
}
