import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
