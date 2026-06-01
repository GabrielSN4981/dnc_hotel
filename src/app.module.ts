import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HotelModule } from './modules/hotels/hotel.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 5000,
        limit: 10,
      },
    ]),
    MailerModule.forRoot({
      transport: process.env.SMTP,
      defaults: {
        from: `'dnc-hotel' <${process.env.EMAIL_USER}>`,
      },
    }),
    HotelModule,
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
