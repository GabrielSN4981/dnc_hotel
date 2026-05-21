import { OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'generated/prisma/browser';
import { CreateUserDTO } from 'src/modules/users/domain/dto/createUser.dto';

export class AuthRegisterDTO extends OmitType(CreateUserDTO, ['role']) {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
