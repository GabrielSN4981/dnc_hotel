import { User } from 'generated/prisma/client';
import { CreateUserDTO } from '../dto/createUser.dto';
import { UpdateUserDTO } from '../dto/updateUser.dto';

export interface IUserRepository {
  createUser(data: CreateUserDTO): Promise<User>;
  findAllUsers(offSet: number, limit: number): Promise<User[]>;
  findOneUser(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateUser(id: number, data: UpdateUserDTO): Promise<User>;
  deleteUser(id: number): Promise<User>;
  uploadAvatar(id: number, avatarFilename: string): Promise<User>;
  countUsers(): Promise<number>;
}
