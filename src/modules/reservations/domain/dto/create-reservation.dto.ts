import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReservationStatus } from 'generated/prisma/client';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty()
  hotelId!: number;

  @IsString()
  @IsNotEmpty()
  checkIn!: string;

  @IsString()
  @IsNotEmpty()
  checkOut!: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(ReservationStatus)
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  @Transform((value) => value ?? ReservationStatus.PENDING)
  status!: ReservationStatus;
}
