import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class AuthResetPasswordDTO {
  @IsJWT()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
