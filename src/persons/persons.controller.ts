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

import { CreatePersonsDto } from './dto/create-persons-dto.js';
import { PersonsService } from './persons.service.js';

@Controller('persons')
export class PersonsController {
  // Inject the service via the constructor
  constructor(private readonly personsService: PersonsService) {}

  @Get() // get all
  findAll() {
    return this.personsService.findAll();
  }

  @Post() //  create  new data
  create(@Body() dto: CreatePersonsDto) {
    return this.personsService.create(dto);
  }

  // Update endpoint (e.g., PATCH /persons/:id)

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePersonsDto>,
  ) {
    return this.personsService.update(id, dto);
  }

  // Delete endpoint (e.g., DELETE /persons/:id)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personsService.remove(id);
  }
}
