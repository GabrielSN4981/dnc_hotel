import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role, User } from 'generated/prisma/client';
import { AuthLoginDTO } from './domain/dto/authLogin.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/user.service';
import { CreateUserDTO } from '../users/domain/dto/createUser.dto';
import { AuthRegisterDTO } from './domain/dto/authRegister.dto';
import { AuthResetPasswordDTO } from './domain/dto/authResetPassword.dto';
import { ValidateTokenDTO } from './domain/dto/validateToken.dto';
import { StringValue } from 'ms';
import { MailerService } from '@nestjs-modules/mailer';
import { templateHTML } from './utils/templateHTML';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  async generateJwtToken(user: User, expiresIn: StringValue = '1d') {
    const payload = { sub: user.id, name: user.name };
    const options: JwtSignOptions = {
      expiresIn,
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

  async reset({ token, password }: AuthResetPasswordDTO) {
    const { valid, decoded } = await this.validateToken(token);

    if (!valid || !decoded) throw new UnauthorizedException('Invalid token');

    const user = await this.userService.update(Number(decoded.sub), {
      password,
    });

    return await this.generateJwtToken(user);
  }

  async forgot(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Email is incorrect');

    const token = await this.generateJwtToken(user, '30m');

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request - DNC Hotel',
      html: templateHTML(user.name, token.access_token),
    });

    return `A password reset link has been sent to ${email}. Please check your inbox.`;
  }

  async validateToken(token: string): Promise<ValidateTokenDTO> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        issuer: 'dnc_hotel',
        audience: 'users',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { valid: true, decoded };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
