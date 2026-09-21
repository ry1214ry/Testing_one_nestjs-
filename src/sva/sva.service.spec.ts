import { Test, TestingModule } from '@nestjs/testing';
import { SvaService } from './sva.service.js';

describe('SvaService', () => {
  let service: SvaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SvaService],
    }).compile();

    service = module.get<SvaService>(SvaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
