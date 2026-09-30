// src/dogs/dogs.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dog } from './entities/dog.entity.js';
import { AuthModule } from '../auths/auths.module.js';
import { DogsController } from './dogs.controller.js';
import { DogsService } from './dogs.service.js';
 // <-- CRITICAL: Imports AuthModule so AuthGuard('jwt') works!

@Module({
  imports: [
    TypeOrmModule.forFeature([Dog]),
    AuthModule, // <-- Links authentication context to this module
  ],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}
