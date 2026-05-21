import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwtToken(user: User) {
    const payload = { sub: user.id, name: user.name };
    const options: JwtSignOptions = {
      expiresIn: '1d',
      issuer: 'dnc_hotel',
      audience: 'users',
    };

    return { access_token: this.jwtService.sign(payload, options) };
  }
}
