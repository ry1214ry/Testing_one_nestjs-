// src/dogs/dogs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dog } from './entities/dog.entity.js';
import { CreateDogDto } from './dto/create-dog.dto.js';
import { UpdateDogDto } from './dto/update-dog.dto.js';


@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(Dog)
    private readonly dogRepository: Repository<Dog>,
  ) {}

  async create(createDogDto: CreateDogDto): Promise<Dog> {
    const newDog = this.dogRepository.create(createDogDto);
    return await this.dogRepository.save(newDog);
  }

  async findAll(): Promise<Dog[]> {
    return await this.dogRepository.find();
  }

  async findOne(id: number): Promise<Dog> {
    const dog = await this.dogRepository.findOneBy({ id });
    if (!dog) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
    return dog;
  }

  async update(id: number, updateDogDto: UpdateDogDto): Promise<Dog> {
    const dog = await this.findOne(id);
    Object.assign(dog, updateDogDto);
    return await this.dogRepository.save(dog);
  }

  async remove(id: number): Promise<void> {
    const result = await this.dogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Dog with ID ${id} not found`);
    }
  }
}
