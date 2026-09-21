import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common';

import { DogsService } from './dogs.service.js';
import { CreateDogsDto } from './dto/create-dogs-dto.js';
import { Dog } from './entities/dog.entity.js';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) { }

 // psot  data
  @Post()
  create(@Body() dto: CreateDogsDto): Promise<Dog>{
    return  this.dogsService.create(dto);
  }

  // get all data

  @Get()
  findAll(): Promise<Dog[]>{
    return this.dogsService.findAll();
  }

  // get data by id

  @Get(':id ')
  findOne(@Param('id', ParseIntPipe) id: Number): Promise<Dog>{
    return this.dogsService.findOne(id);
  }









}
