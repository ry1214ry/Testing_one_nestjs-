import { Test, TestingModule } from '@nestjs/testing';
import { PersonsController } from './persons.controller.js';
import { PersonsService } from './persons.service.js';

describe('PersonsController', () => {
  let controller: PersonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonsController],
      providers: [PersonsService],
    }).compile();

    controller = module.get<PersonsController>(PersonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
