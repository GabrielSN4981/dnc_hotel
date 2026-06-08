import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserRepositories } from '../infra/user.repository';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';
import { resolve, join } from 'path';
import { stat, unlink } from 'fs/promises';
import { USER_REPOSITORY_TOKEN } from 'src/shared/utils/repositoriesTokens';

@Injectable()
export class UploadAvatarUserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepositories: UserRepositories,
  ) {}

  async execute(id: number, avatarFileName: UpdateUserDTO) {
    const user = await this.userRepositories.findOneUser(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const directory = resolve(process.cwd(), 'uploads');

    if (user.avatar) {
      const userAvatarFilePath = join(directory, user.avatar);
      const userAvatarFileExists = await stat(userAvatarFilePath);

      if (userAvatarFileExists) {
        await unlink(userAvatarFilePath);
      }
    }

    const userUpdated = await this.userRepositories.updateUser(
      id,
      avatarFileName,
    );

    return userUpdated;
  }
}
