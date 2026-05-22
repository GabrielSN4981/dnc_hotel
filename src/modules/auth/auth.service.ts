import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User } from 'generated/prisma/client';
import { AuthLoginDTO } from './domain/dto/authLogin.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { CreateUserDTO } from '../users/domain/dto/createUser.dto';
import { AuthRegisterDTO } from './domain/dto/authRegister.dto';
import { AuthResetPasswordDTO } from './domain/dto/authResetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async generateJwtToken(user: User) {
    const payload = { sub: user.id, name: user.name };
    const options: JwtSignOptions = {
      expiresIn: '1d',
      issuer: 'dnc_hotel',
      audience: 'users',
    };

    return { access_token: await this.jwtService.signAsync(payload, options) };
  }

  async login({ email, password }: AuthLoginDTO) {
    const user = await this.userService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return await this.generateJwtToken(user);
  }

  async register(body: AuthRegisterDTO) {
    const newUser: CreateUserDTO = {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role ?? Role.USER,
    };
    const user = await this.userService.create(newUser);
    return await this.generateJwtToken(user);
  }

  async resetPassword({ token, password }: AuthResetPasswordDTO) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { valid, decoded } = await this.jwtService.verifyAsync(token);

    if (!valid) throw new UnauthorizedException('Invalid token');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const user = await this.userService.update(decoded.sub, { password });

    return await this.generateJwtToken(user);
  }
}
