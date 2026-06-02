import { Body, Controller, Post } from '@nestjs/common';
import { CreateReservationService } from '../services/createReservation.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
  ) {}

  @Post()
  create(@Body() data: CreateReservationDto) {
    return this.createReservationService.create(data);
  }
}
