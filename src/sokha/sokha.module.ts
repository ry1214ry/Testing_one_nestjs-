import { Module } from '@nestjs/common';
import { SokhaController } from './sokha.controller.js';
import { SokhaService } from './sokha.service.js';

@Module({
  controllers: [SokhaController],
  providers: [SokhaService]
})
export class SokhaModule {}
