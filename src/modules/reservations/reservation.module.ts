import { Module } from '@nestjs/common';
import { CreateReservationService } from './services/createReservation.service';
import { ReservationController } from './infra/reservation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { HotelModule } from '../hotels/hotel.module';
import {
  HOTEL_REPOSITORY_TOKEN,
  RESERVATION_REPOSITORY_TOKEN,
} from 'src/shared/utils/repositoriesTokens';
import { ReservationRepository } from './infra/reservations.repository';
import { FindAllReservationService } from './services/findAllReservation.service';
import { FindByIdReservationService } from './services/findByIdReservation.service';
import { FindByUserReservationService } from './services/findByUserReservation.service';
import { UpdateStatusReservationService } from './services/updateStatusReservation.service';
import { HotelsRepositories } from '../hotels/infra/hotels.repository';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelModule],
  controllers: [ReservationController],
  providers: [
    CreateReservationService,
    FindAllReservationService,
    FindByIdReservationService,
    FindByUserReservationService,
    UpdateStatusReservationService,
    {
      provide: RESERVATION_REPOSITORY_TOKEN,
      useClass: ReservationRepository,
    },
    {
      provide: HOTEL_REPOSITORY_TOKEN,
      useClass: HotelsRepositories,
    },
  ],
})
export class ReservationModule {}
