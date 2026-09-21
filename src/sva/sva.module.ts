import { Module } from '@nestjs/common';
import { SvaController } from './sva.controller.js';
import { SvaService } from './sva.service.js';

@Module({
  controllers: [SvaController],
  providers: [SvaService],
})
export class SvaModule {}
