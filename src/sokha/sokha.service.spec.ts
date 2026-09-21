import { Test, TestingModule } from '@nestjs/testing';
import { SokhaService } from './sokha.service.js';

describe('SokhaService', () => {
  let service: SokhaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SokhaService],
    }).compile();

    service = module.get<SokhaService>(SokhaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
