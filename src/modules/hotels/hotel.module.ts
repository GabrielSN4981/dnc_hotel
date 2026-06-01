import { Module } from '@nestjs/common';
import { CreateHotelService } from './services/createHotel.service';
import { HotelController } from './infra/hotel.controller';
import { FindAllHotelService } from './services/findAllHotel.service';
import { FindOneHotelService } from './services/findOneHotel.service';
import { UpdateHotelService } from './services/updateHotel.service';
import { RemoveHotelService } from './services/removeHotel.service';
import { HotelsRepositories } from './infra/hotels.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { HOTEL_REPOSITORY_TOKEN } from './utils/repositoriesTokens';
import { FindByNameHotelService } from './services/findByNameHotel.service';
import { FindByOwnerHotelService } from './services/findByOwnerHotel.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [HotelController],
  providers: [
    CreateHotelService,
    FindAllHotelService,
    FindByNameHotelService,
    FindByOwnerHotelService,
    FindOneHotelService,
    RemoveHotelService,
    UpdateHotelService,
    {
      provide: HOTEL_REPOSITORY_TOKEN,
      useClass: HotelsRepositories,
    },
  ],
})
export class HotelModule {}
