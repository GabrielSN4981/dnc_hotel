import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDTO } from '../domain/dto/createUser.dto';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { UserMatchGuard } from 'src/shared/guards/userMatch.guard';
import { /* SkipThrottle */ Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor';
import { CreateUserService } from '../services/createUser.service';
import { UpdateUserService } from '../services/updateUser.service';
import { DeleteUserService } from '../services/deleteUser.service';
import { FindAllUsersService } from '../services/findAllUsers.service';
import { FindOneUserService } from '../services/findOneUser.service';
import { FindByEmailUserService } from '../services/findByEmailUser.service';
import { UploadAvatarUserService } from '../services/uploadAvatarUser.service';

@UseGuards(AuthGuard, RoleGuard, ThrottlerGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly findAllUsersService: FindAllUsersService,
    private readonly findOneUserService: FindOneUserService,
    private readonly findByEmailUserService: FindByEmailUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly uploadAvatarUserService: UploadAvatarUserService,
  ) {}

  // @SkipThrottle()
  @Throttle({ default: { ttl: 5000000, limit: 20 } })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateUserDTO) {
    return this.createUserService.execute(body);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '3',
  ) {
    return this.findAllUsersService.execute(Number(page), Number(limit));
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOneUserService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.findByEmailUserService.execute(email);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Patch(':id')
  update(@ParamId() id: number, @Body() body: UpdateUserDTO) {
    return this.updateUserService.execute(id, body);
  }

  @UseGuards(UserMatchGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Delete(':id')
  delete(@ParamId() id: number) {
    return this.deleteUserService.execute(id);
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
    return this.uploadAvatarUserService.execute(id, {
      avatar: avatar.filename,
    });
  }
}
