import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/browser';
import { CreatePeopleDto } from './dto/create-people.dto.js';
import { UpdatePeopleDto } from './dto/update-people.dto.js';
import { People } from './entities/people.entity.js';

@Injectable()
export class PeoplesService {
  constructor(
    @InjectRepository(People)
    private readonly PeopleRepository: Repository<People>,
  ) {}

  async create(createPeopleDto: CreatePeopleDto): Promise<People> {
    const newPeople = await this.PeopleRepository.create(createPeopleDto);
    return await this.PeopleRepository.save(newPeople);
  }

  async findAll(): Promise<People[]> {
    return await this.PeopleRepository.find();
  }

  async findOne(id: number): Promise<People> {
    const People = await this.PeopleRepository.findOneBy({ id });
    if (!People) {
      throw new NotFoundException(`People with id ${id} not found`);
    }
    return People;
  }

  async update(id: number, updatePeopleDto: UpdatePeopleDto): Promise<People> {
    const People = await this.PeopleRepository.findOneBy({ id });
    if (!People) {
      throw new NotFoundException(`People with id ${id} not found`);
    }
    Object.assign(People, UpdatePeopleDto);
    return await this.PeopleRepository.save(People);
  }

  async remove(id: number) {
    const result = await this.PeopleRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`People with id ${id} not found `);
    }
    return result;
  }
}
