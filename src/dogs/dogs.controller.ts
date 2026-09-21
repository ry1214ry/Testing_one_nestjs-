import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DogsService } from './dogs.service.js';
import { CreateDogsDto } from './dto/create-dogs-dto.js';
import { Dog } from './entities/dog.entity.js';



@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  // Post new data
  @Post()
  create(@Body() dto: CreateDogsDto): Promise<Dog> {
    return this.dogsService.create(dto);
  }

  // Get all data
  @Get()
  findAll(): Promise<Dog[]> {
    return this.dogsService.findAll();
  }

  // Get data by id (FIXED: removed extra space inside ':id')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Dog> {
    return this.dogsService.findOne(id);
  }
}
