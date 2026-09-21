import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePersonsDto } from './dto/create-persons-dto.js';

export interface Persons {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: number;
}
@Injectable()
export class PersonsService {
  private Person: Persons[] = [];
  findAll(): Persons[] {
    return this.Person;
  }
  create(dto: CreatePersonsDto): Persons {
    const newPersons: Persons = {
      id: Date.now(), 
      ...dto,
    };
    this.Person.push(newPersons);
    return newPersons;
  }
  // Update method added here
  update(id: number, dto: Partial<CreatePersonsDto>): Persons {
    const index = this.Person.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    // Merge existing data with the updated fields
    this.Person[index] = {
      ...this.Person[index],
      ...dto,
    };
    return this.Person[index];
  }

  // Optional: Remove method for completeness
  remove(id: number): void {
    const index = this.Person.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    this.Person.splice(index, 1);
  }
}
