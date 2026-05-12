import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from 'generated/prisma/client';
import { CreateUserDTO } from './domain/dto/createUser.dto';
import { UpdateUserDTO } from './domain/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return await this.prisma.user.findMany();
  }

  async show(id: number) {
    const user = await this.idExists(id);
    return user;
  }

  async create(body: CreateUserDTO): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.prisma.user.create({ data: body });
  }

  async update(id: number, body: UpdateUserDTO): Promise<User> {
    await this.idExists(id);
    return await this.prisma.user.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: body,
    });
  }

  async delete(id: number) {
    await this.idExists(id);
    return await this.prisma.user.delete({ where: { id } });
  }

  private async idExists(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
