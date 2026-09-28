import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { People } from './entities/people.entity.js';
import { PeoplesController } from './peoples.controller.js';
import { PeoplesService } from './peoples.service.js';

describe('PeoplesController', () => {
  let controller: PeoplesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeoplesController],
      providers: [
        PeoplesService,
        {
          provide: getRepositoryToken(People),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PeoplesController>(PeoplesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
