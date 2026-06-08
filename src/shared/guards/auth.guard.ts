import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { FindOneUserService } from 'src/modules/users/services/findOneUser.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly findOneUserService: FindOneUserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();

    const { authorization } = request.headers;

    if (!authorization || !authorization.startsWith('Bearer '))
      throw new UnauthorizedException('Invalid token');

    const token = authorization.split(' ')[1];

    const { valid, decoded } = await this.authService.validateToken(token);

    if (!valid) throw new UnauthorizedException('Invalid token');

    const user = await this.findOneUserService.execute(Number(decoded?.sub));

    if (!user) throw new UnauthorizedException('User not found');

    request.user = user;

    return true;
  }
}
