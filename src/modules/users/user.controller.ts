import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './domain/dto/createUser.dto';
import { UpdateUserDTO } from './domain/dto/updateUser.dto';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { Role, type User as UserType } from 'generated/prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { UserMatchGuard } from 'src/shared/guards/userMatch.guard';
import { /* SkipThrottle */ Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor';

@UseGuards(AuthGuard, RoleGuard, ThrottlerGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @SkipThrottle()
  @Throttle({ default: { ttl: 5000000, limit: 20 } })
  @Roles(Role.ADMIN)
  @Get()
  list(@User('email') user: UserType) {
    console.log(user);
    return this.userService.list();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  show(@ParamId() id: number) {
    return this.userService.show(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateUserDTO) {
    return this.userService.create(body);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Patch(':id')
  update(@ParamId() id: number, @Body() body: UpdateUserDTO) {
    return this.userService.update(id, body);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Delete(':id')
  delete(@ParamId() id: number) {
    return this.userService.delete(id);
  }

  @UseInterceptors(FileInterceptor('avatar'), FileValidationInterceptor)
  @Post('avatar')
  uploadAvatar(
    @User('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            skipMagicNumbersValidation: true,
            fileType: /image\/(png|jpeg|jpg)/,
          }),
          new MaxFileSizeValidator({
            // o tamanho maximo em KB será mudado se mudar o primeiro numero (ex: 100 * 1024 para 100KB)
            // para MB faça * 1024 novamente (ex: 2 * 1024 * 1024 para 2MB)
            maxSize: 400 * 1024, // 400KB
          }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(id, avatar.filename);
  }
}
