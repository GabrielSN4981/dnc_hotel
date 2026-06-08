import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './infra/auth.controller';
import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
    PrismaModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
