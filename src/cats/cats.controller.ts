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

import { CatsService } from './cats.service.js';
import { CreateCatDto } from './dto/create-cat-dto.js';
import { UpdateCatDto } from './dto/update-cat-dto.js';
import { Cat } from './entities/cat.entity.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get('all') // Get all cats
  findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id') // Get one cat by ID
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  @Post('create') // Create a new cat
  create(@Body() dto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(dto);
  }

  @Patch('update/:id') // Update a cat by ID
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCatDto,
  ): Promise<Cat> {
    return this.catsService.update(id, dto);
  }

  @Delete('delete/:id') // Delete a cat by ID
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.catsService.remove(id);
  }
}
