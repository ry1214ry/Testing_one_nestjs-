import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles/roles.guard.js';
import { CarsService } from './cars.service.js';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('cars')
export class CarsController {

  constructor(private readonly carsService: CarsService) {}

  @Post()
    @UseGuards(RolesGuard)
  create(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }
  @UseInterceptors(CacheInterceptor)
  @Get()
  findAll() {
    return this.carsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(+id);
  }

  @Put(':id')
    update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
  return this.carsService.update(+id, updateCarDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carsService.remove(+id);
  }


}
