import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDogsDto } from './dto/create-dogs-dto.js';
import { UpdateDogsDto } from './dto/update-dogs-dto.js';
import { Dog } from './entities/dog.entity.js';

@Injectable()
export class DogsService {

  constructor(
    // create repository
    @InjectRepository(Dog)
    private readonly DogRepository: Repository<Dog>,
  ) { }

  // create data
  async create(createDogDto: CreateDogsDto): Promise<Dog>{
    const newDog = this.DogRepository.create(createDogDto);
    return await this.DogRepository.save(newDog);
  }

  // get all data
  async findAll(): Promise<Dog[]>{
    return await this.DogRepository.find();
  }

  // get data by id
  async findOne(id: Number): Promise<Dog> {
    const Dog = await this.DogRepository.findOneBy({ id });
    if (!Dog) {
      throw new NotFoundException(`Dog with ID  ${id} not found `)
    }
    return Dog;
  }

  async update(id: Number, UpdateDogsDto: UpdateDogsDto): Promise<Dog>{
    const dog = await this.findOne(id);
    Object.assign(dog, UpdateDogsDto)
    return await this.DogRepository.save(dog);
  }


  async remove(id: number): Promise<void> {
    const result = await this.DogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
  }


}
