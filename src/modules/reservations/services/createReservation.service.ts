import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import {
  HOTEL_REPOSITORY_TOKEN,
  RESERVATION_REPOSITORY_TOKEN,
} from 'src/shared/utils/repositoriesTokens';
import type { IReservationRepository } from '../domain/repositories/IReservation.repositories';
import type { IHotelRepository } from 'src/modules/hotels/domain/repositories/IHotel.repositories';
import { differenceInDays, parseISO } from 'date-fns';
import { ReservationStatus } from 'generated/prisma/client';

@Injectable()
export class CreateReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepositories: IReservationRepository,
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelsRepositories: IHotelRepository,
  ) {}

  async execute(id: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn);
    const checkOutDate = parseISO(data.checkOut);
    const daysOfStay = differenceInDays(checkInDate, checkOutDate);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException(
        'Check-out date must be after check-in date.',
      );
    }

    const hotel = await this.hotelsRepositories.findHotelById(data.hotelId);

    if (!hotel) throw new NotFoundException('Hotel not found.');

    if (typeof hotel.price !== 'number' || hotel.price <= 0) {
      throw new BadRequestException('Invalid hotel price.');
    }

    const total = daysOfStay * hotel.price;

    const newReservation = {
      ...data,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      total,
      userId: id,
      status: ReservationStatus.PENDING,
    };

    return this.reservationRepositories.create(newReservation);
  }
}
