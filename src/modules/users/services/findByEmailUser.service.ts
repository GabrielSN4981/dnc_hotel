import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepositories } from '../infra/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';

@Injectable()
export class FindByEmailUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: UserRepositories,
  ) {}

  async execute(email: string) {
    const foundedEmail = await this.userRepositories.findByEmail(email);
    if (!foundedEmail) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    return foundedEmail;
  }
}
