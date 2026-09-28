import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { People } from './entities/people.entity.js';
import { PeoplesController } from './peoples.controller.js';
import { PeoplesService } from './peoples.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([People])],
  controllers: [PeoplesController],
  providers: [PeoplesService],
})
export class PeoplesModule {}
