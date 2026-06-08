import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './infra/user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserIdCheckMiddleware } from 'src/shared/middlewares/userIdCheck.middleware';
import { AuthModule } from '../auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserService } from './services/createUser.service';
import { UpdateUserService } from './services/updateUser.service';
import { FindAllUsersService } from './services/findAllUsers.service';
import { FindOneUserService } from './services/findOneUser.service';
import { FindByEmailUserService } from './services/findByEmailUser.service';
import { DeleteUserService } from './services/deleteUser.service';
import { UploadAvatarUserService } from './services/uploadAvatarUser.service';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import { UserRepositories } from './infra/user.repository';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${file.originalname}`;
          return cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    CreateUserService,
    UpdateUserService,
    FindAllUsersService,
    FindOneUserService,
    FindByEmailUserService,
    DeleteUserService,
    UploadAvatarUserService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositories,
    },
  ],
  exports: [
    CreateUserService,
    UpdateUserService,
    FindOneUserService,
    FindByEmailUserService,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdCheckMiddleware)
      .forRoutes(
        { path: 'users/:id', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.PATCH },
        { path: 'users/:id', method: RequestMethod.DELETE },
      );
  }
}
