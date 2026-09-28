import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { People } from './entities/people.entity.js';
import { PeoplesService } from './peoples.service.js';

describe('PeoplesService', () => {
  let service: PeoplesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PeoplesService>(PeoplesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
