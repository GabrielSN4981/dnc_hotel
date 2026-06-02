import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateReservationService } from '../services/createReservation.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { FindAllReservationService } from '../services/findAllReservation.service';
import { FindByIdReservationService } from '../services/findByIdReservation.service';
import { FindByUserReservationService } from '../services/findByUserReservation.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';

@UseGuards(AuthGuard)
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
    private readonly findAllReservationService: FindAllReservationService,
    private readonly findByIdReservationService: FindByIdReservationService,
    private readonly findByUserReservationService: FindByUserReservationService,
  ) {}

  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationService.execute(id, body);
  }

  @Get()
  findAll() {
    return this.findAllReservationService.execute();
  }

  @Get('user')
  findByUser(@User('id') id: number) {
    return this.findByIdReservationService.execute(id);
  }

  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findByIdReservationService.execute(id);
  }
}
