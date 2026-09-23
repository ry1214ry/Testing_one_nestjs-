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
    async update(id: number, updateCarDto: UpdateCarDto) {
  const car = await this.CarRepository.findOneBy({ id });
  if (!car) {
    throw new NotFoundException(`Car with ID ${id} not found`);
  }
  Object.assign(car, updateCarDto);
  return await this.CarRepository.save(car);
    }

    
   async remove(id: number): Promise<void>{
      const result = await this.CarRepository.delete(id);
      if (result.affected === 0) {
          throw new NotFoundException(`car wiht ${id} not found `);
      }
    }
}
