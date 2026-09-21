import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DogsService } from './dogs.service.js';
import { CreateDogsDto } from './dto/create-dogs-dto.js';
import { UpdateDogsDto } from './dto/update-dogs-dto.js';
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

  @Patch()
  update(
    @Param('id', ParseIntPipe) id: Number,
    @Body () dto: UpdateDogsDto,
  ): Promise<Dog>{
    return this.dogsService.update(id, dto);
  }


 @Delete(':id') // Delete a cat by ID
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dogsService.remove(id);
  }

}
