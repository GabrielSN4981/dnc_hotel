import { Hotel } from 'generated/prisma/client';
import { CreateHotelDto } from '../domain/dto/createHotel.dto';
import { IHotelRepository } from '../domain/repositories/IHotel.repositories';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateHotelDto } from '../domain/dto/updateHotel.dto';

@Injectable()
export class HotelsRepositories implements IHotelRepository {
  constructor(private readonly prisma: PrismaService) {}

  createHotel(data: CreateHotelDto, id: number): Promise<Hotel> {
    data.ownerId = id;
    return this.prisma.hotel.create({ data });
  }

  findHotels(): Promise<Hotel[]> {
    return this.prisma.hotel.findMany();
  }

  findHotelByName(name: string): Promise<Hotel[] | null> {
    return this.prisma.hotel.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  findHotelByOwner(ownerId: number): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({ where: { ownerId } });
  }

  findHotelById(id: number): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({ where: { id } });
  }

  deleteHotel(id: number): Promise<Hotel> {
    return this.prisma.hotel.delete({ where: { id } });
  }

  updateHotel(id: number, data: UpdateHotelDto): Promise<Hotel> {
    return this.prisma.hotel.update({ where: { id }, data });
  }
}
