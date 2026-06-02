import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateReservationService } from '../services/createReservation.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { FindAllReservationService } from '../services/findAllReservation.service';
import { FindByIdReservationService } from '../services/findByIdReservation.service';
import { UpdateStatusReservationService } from '../services/updateStatusReservation.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { ReservationStatus, Role } from 'generated/prisma/client';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@UseGuards(AuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
    private readonly findAllReservationService: FindAllReservationService,
    private readonly findByIdReservationService: FindByIdReservationService,
    private readonly updateStatusReservationService: UpdateStatusReservationService,
  ) {}

  @Roles(Role.USER)
  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationService.execute(id, body);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.findAllReservationService.execute();
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('user')
  findByUser(@User('id') id: number) {
    return this.findByIdReservationService.execute(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findByIdReservationService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  updateStatus(
    @ParamId() id: number,
    @Body('status') status: ReservationStatus,
  ) {
    return this.updateStatusReservationService.execute(id, status);
  }
}
