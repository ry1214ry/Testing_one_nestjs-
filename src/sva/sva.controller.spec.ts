import { Test, TestingModule } from '@nestjs/testing';
import { SvaController } from './sva.controller.js';

describe('SvaController', () => {
  let controller: SvaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SvaController],
    }).compile();

    controller = module.get<SvaController>(SvaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
