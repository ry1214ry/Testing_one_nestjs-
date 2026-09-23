import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CarsModule } from './cars/cars.module.js';
import { CatsModule } from './cats/cats.module.js';
import { Cat } from './cats/entities/cat.entity.js';
import { DogsModule } from './dogs/dogs.module.js';
@Module({
  imports: [
    // 1. Database Connection Configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Xanji!@#3210',
      database: 'Testing_one',
      entities: [Cat],
      autoLoadEntities: true,
      synchronize: true,
    }),
    // registeer all module  that have  in database connection
    CatsModule,
    DogsModule,
    CarsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
