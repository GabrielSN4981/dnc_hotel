import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/repositories/IUser.repositories';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { User } from 'generated/prisma/client';
import { CreateUserDTO } from '../domain/dto/createUser.dto';
import { UpdateUserDTO } from '../domain/dto/updateUser.dto';
import { userSelectFields } from 'src/modules/prisma/utils/userSelectFields';

@Injectable()
export class UserRepositories implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(data: CreateUserDTO): Promise<User> {
    return this.prisma.user.create({ data, select: userSelectFields });
  }

  findAllUsers(offSet: number, limit: number): Promise<User[]> {
    return this.prisma.user.findMany({
      take: limit,
      skip: offSet,
    });
  }

  countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  findOneUser(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  updateUser(id: number, data: UpdateUserDTO): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  uploadAvatar(id: number, avatarFilename: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { avatar: avatarFilename },
    });
  }
}
