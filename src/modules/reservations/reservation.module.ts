import { Module } from '@nestjs/common';
import { CreateReservationService } from './services/createReservation.service';
import { ReservationController } from './infra/reservation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { HotelModule } from '../hotels/hotel.module';
import { RESERVATION_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import { ReservationRepository } from './infra/reservations.repository';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelModule],
  controllers: [ReservationController],
  providers: [
    CreateReservationService,
    {
      provide: RESERVATION_REPOSITORY_TOKEN,
      useClass: ReservationRepository,
    },
  ],
})
export class ReservationModule {}
