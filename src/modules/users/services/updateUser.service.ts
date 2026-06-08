import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import type { IUserRepository } from '../domain/repositories/IUser.repositories';

@Injectable()
export class UpdateUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: IUserRepository,
  ) {}

  async execute(id: number, data: UpdateUserDTO) {
    const existingEmail = data.email
      ? await this.userRepositories.findByEmail(data.email)
      : null;

    if (existingEmail) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }

    return this.userRepositories.updateUser(id, data);
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
