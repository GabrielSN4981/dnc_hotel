import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepositories } from '../infra/user.repository';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';

@Injectable()
export class FindOneUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: UserRepositories,
  ) {}

  async execute(id: number) {
    const user = await this.userRepositories.findOneUser(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
