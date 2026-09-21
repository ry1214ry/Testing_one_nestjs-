import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatDto } from './dto/create-cat-dto.js';
import { UpdateCatDto } from './dto/update-cat-dto.js';
import { Cat } from './entities/cat.entity.js';

@Injectable()
export class CatsService {

  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  // create data
  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const newCat = this.catRepository.create(createCatDto);
    return await this.catRepository.save(newCat);
  }

  // get all data
  async findAll(): Promise<Cat[]> {
    return await this.catRepository.find();
  }

  //  get data | by one specifix id
  async findOne(id: number): Promise<Cat> {
    const cat = await this.catRepository.findOneBy({ id });
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return cat;
  }

  // update data  by id
  async update(id: number, updateCatDto: UpdateCatDto): Promise<Cat> {
    const cat = await this.findOne(id); // Checks if cat exists (throws NotFoundException if not)
    Object.assign(cat, updateCatDto);   // Overwrites updated properties
    return await this.catRepository.save(cat);
  }

  // remove data by id
  async remove(id: number): Promise<void> {
    const result = await this.catRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
  }

}
