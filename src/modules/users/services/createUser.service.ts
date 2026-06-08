import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../domain/dto/createUser.dto';
import { UserRepositories } from '../infra/user.repository';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: UserRepositories,
  ) {}

  async execute(body: CreateUserDTO) {
    const email = await this.userRepositories.findByEmail(body.email);

    if (email) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    body.password = await this.hashPassword(body.password);

    return await this.userRepositories.createUser(body);
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
