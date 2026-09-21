import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DogsController } from './dogs.controller.js';
import { DogsService } from './dogs.service.js';
import { Dog } from './entities/dog.entity.js';

@Module({
  // register entity Dog
  imports:[TypeOrmModule.forFeature([Dog])],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}
