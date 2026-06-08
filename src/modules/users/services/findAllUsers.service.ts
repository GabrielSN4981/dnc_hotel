import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';
import type { IUserRepository } from '../domain/repositories/IUser.repositories';

@Injectable()
export class FindAllUsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: IUserRepository,
  ) {}

  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit;
    const data = await this.userRepositories.findAllUsers(offSet, limit);
    const total = await this.userRepositories.countUsers();

    return { total, page, per_page: limit, data };
  }
}
