import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateHotelDto } from '../domain/dto/createHotel.dto';
import { CreateHotelService } from '../services/createHotel.service';
import { UpdateHotelService } from '../services/updateHotel.service';
import { RemoveHotelService } from '../services/removeHotel.service';
import { FindAllHotelService } from '../services/findAllHotel.service';
import { FindOneHotelService } from '../services/findOneHotel.service';
import { UpdateHotelDto } from '../domain/dto/updateHotel.dto';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { FindByNameHotelService } from '../services/findByNameHotel.service';
import { FindByOwnerHotelService } from '../services/findByOwnerHotel.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'generated/prisma/browser';
import { OwnerHotelGuard } from 'src/shared/guards/ownerHotel.guard';
import { User } from 'src/shared/decorators/user.decorator';

@UseGuards(AuthGuard, RoleGuard)
@Controller('hotels')
export class HotelController {
  constructor(
    private readonly createHotelService: CreateHotelService,
    private readonly findAllHotelService: FindAllHotelService,
    private readonly findByNameHotelService: FindByNameHotelService,
    private readonly findByOwnerHotelService: FindByOwnerHotelService,
    private readonly findOneHotelService: FindOneHotelService,
    private readonly removeHotelService: RemoveHotelService,
    private readonly updateHotelService: UpdateHotelService,
  ) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@User('id') id: number, @Body() CreateHotelDto: CreateHotelDto) {
    return this.createHotelService.execute(CreateHotelDto, id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.findAllHotelService.execute();
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('name')
  findByName(@Query('name') name: string) {
    return this.findByNameHotelService.execute(name);
  }

  @Roles(Role.ADMIN)
  @Get('owner')
  findByOwner(@User('id') id: number) {
    return this.findByOwnerHotelService.execute(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOneHotelService.execute(id);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@ParamId() id: number) {
    return this.removeHotelService.execute(id);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@ParamId() id: number, @Body() data: UpdateHotelDto) {
    return this.updateHotelService.execute(id, data);
  }
}
