import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarsController } from './cars.controller.js';
import { CarsService } from './cars.service.js';
import { Car } from './entities/car.entity.js';

describe('CarsController', () => {
  let controller: CarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        CarsService,
        {
          provide: getRepositoryToken(Car),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CarsController>(CarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});