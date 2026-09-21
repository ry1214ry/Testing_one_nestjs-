import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';
import { Cat } from './entities/cat.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Cat])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
