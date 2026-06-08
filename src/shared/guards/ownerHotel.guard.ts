import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { FindOneHotelService } from 'src/modules/hotels/services/findOneHotel.service';

@Injectable()
export class OwnerHotelGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly hotelService: FindOneHotelService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: {
          id: number;
        };
      }
    >();

    const hotelId = Number(request.params.id);
    const { user } = request;

    if (!user) return false;

    const hotel = await this.hotelService.execute(hotelId);

    if (!hotel) return false;

    return hotel.ownerId === user.id;
  }
}
