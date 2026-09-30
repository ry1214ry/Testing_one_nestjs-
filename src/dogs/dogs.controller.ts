// src/dogs/dogs.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DogsService } from './dogs.service.js';
import { CreateDogDto } from './dto/create-dog.dto.js';
import { UpdateDogDto } from './dto/update-dog.dto.js';
import { Dog } from './entities/dog.entity.js';

// 👇 1. Import your Roles decorator and RolesGuard
import { Roles } from '../auths/decorators/roles.decorator.js';
import { RolesGuard } from '../auths/guards/roles.guard.js';
import { Role } from '../users/entities/user.entity.js';

@Controller('dogs')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  // PUBLIC: Anyone can view all dogs
  @Get('all')
  findAll(): Promise<Dog[]> {
    return this.dogsService.findAll();
  }

  // PUBLIC: Anyone can view a specific dog
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Dog> {
    return this.dogsService.findOne(id);
  }

  // PROTECTED: Requires a valid Bearer Access Token (Any logged-in user)
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createDogDto: CreateDogDto): Promise<Dog> {
    return this.dogsService.create(createDogDto);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDogDto: UpdateDogDto,
  ): Promise<Dog> {
    return this.dogsService.update(id, updateDogDto);
  }

  // 👇 2. PROTECTED + STRICTLY ADMIN ONLY
  
  @Delete('delete/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dogsService.remove(id);
  }

}
