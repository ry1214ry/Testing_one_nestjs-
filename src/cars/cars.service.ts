import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarDto } from './dto/update-car.dto.js';
import { Car } from './entities/car.entity.js';

@Injectable()
export class CarsService {

  constructor(
    @InjectRepository(Car)
    private readonly CarRepository : Repository<Car>
  ) { }

  async create(createCarDto: CreateCarDto): Promise<Car>{
    const newCar =  this.CarRepository.create(createCarDto)
    return await this.CarRepository.save(newCar);
  }

  async findAll(): Promise<Car[]>{
    return await this.CarRepository.find();
  }

  async findOne(id: number): Promise<Car>{
    const Car = await this.CarRepository.findOneBy({ id });
    if (!Car) {
      throw new NotFoundException(`Car wiht id ${id} not found `);
    }
    return Car;
  }

  async update(id: number, updateCarDto: UpdateCarDto): Promise<Car>{
    const Car = await this.findOne(id);
    Object.assign(Car, UpdateCarDto)
    return   this, this.CarRepository.save(updateCarDto)
  }

  remove(id: number) {
    return `This action removes a #${id} car`;
  }
}
