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
import { differenceInDays, isValid, parseISO } from 'date-fns';
import { ReservationStatus } from 'generated/prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { FindOneUserService } from 'src/modules/users/services/findOneUser.service';

@Injectable()
export class CreateReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY_TOKEN)
    private readonly reservationRepositories: IReservationRepository,
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelsRepositories: IHotelRepository,
    private readonly mailerService: MailerService,
    private readonly findOneUserService: FindOneUserService,
  ) {}

  async execute(id: number, data: CreateReservationDto) {
    const checkInDate = parseISO(data.checkIn);
    const checkOutDate = parseISO(data.checkOut);
    const daysOfStay = differenceInDays(checkOutDate, checkInDate);

    if (!isValid(checkInDate) || !isValid(checkOutDate)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }

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

    const hotelOwner = await this.findOneUserService.execute(hotel.ownerId);

    await this.mailerService.sendMail({
      to: hotelOwner.email,
      subject: 'Pending Reservation Approval',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; border: 2px solid #041d40; border-radius: 10px; margin: auto; width: 60%;">
          <h1 style="color: #041d40;">Pending Reservation Approval</h1>
          <h3 style="color: #041d40;">Dear Hotel Owner,</h3>
          <p style="font-size: 16px; color: #333;">
            You have a new reservation pending approval. Please review the reservation details and approve or decline the reservation at your earliest convenience.
          </p>
          <p style="font-size: 16px; color: #333;">
            To view the reservation, please access your hotel owner profile
          </p>
          <p style="margin-top: 20px;">
            Thank you for your prompt attention to this matter.
            <br>
            Best regards,
            <br>
            <span style="font-weight: bold; color: #041d40;">
              DNC Hotel Management System
            </span>
          </p>
        </div>
      `,
    });

    return this.reservationRepositories.create(newReservation);
  }
}
