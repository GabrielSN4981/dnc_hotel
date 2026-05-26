import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;

  @IsOptional()
  avatar?: string;
}
