import { Hotel } from 'generated/prisma/client';
import { CreateHotelDto } from '../dto/createHotel.dto';
import { UpdateHotelDto } from '../dto/updateHotel.dto';

export interface IHotelRepository {
  createHotel(data: CreateHotelDto, id: number): Promise<Hotel>;
  findHotels(offSet: number, limit: number): Promise<Hotel[]>;
  findHotelByName(name: string): Promise<Hotel[] | null>;
  findHotelByOwner(ownerId: number): Promise<Hotel[]>;
  findHotelById(id: number): Promise<Hotel | null>;
  deleteHotel(id: number): Promise<Hotel>;
  updateHotel(id: number, data: UpdateHotelDto): Promise<Hotel>;
  countHotels(): Promise<number>;
}
