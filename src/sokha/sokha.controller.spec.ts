import { Test, TestingModule } from '@nestjs/testing';
import { SokhaController } from './sokha.controller.js';

describe('SokhaController', () => {
  let controller: SokhaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SokhaController],
    }).compile();

    controller = module.get<SokhaController>(SokhaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
