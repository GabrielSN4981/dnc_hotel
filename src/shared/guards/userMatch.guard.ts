import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

type JwtUser = {
  id: number;
  name: string;
};

@Injectable()
export class UserMatchGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtUser }>();

    const id = request.params.id;
    const { user } = request;

    if (user?.id !== Number(id)) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource.',
      );
    }

    return true;
  }
}
