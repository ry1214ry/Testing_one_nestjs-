import { Injectable } from '@nestjs/common';
import { CreateSokhaDto } from './dto/create-sokha-dto.js';
import { UpdateSokhaDto } from './dto/update-sokha-dto.js';

export interface Sokha {
  id: number;
  name: string;
  age: number;
  gender: string;
}

@Injectable()
export class SokhaService {
  private Sokhas: Sokha[] = []; // crate varriable Sokhas that use everythings from  on interfce

  findAll(): Sokha[] {
    return this.Sokhas;
  }

  create(dto: CreateSokhaDto): Sokha {
    const newSokha: Sokha = {
      id: Date.now(),
      ...dto,
    };
    this.Sokhas.push(newSokha);
    return newSokha;
  }

  updated() {}
}
