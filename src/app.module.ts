import { CacheModule } from '@nestjs/cache-manager'; // 💾 Fixed: Added missing import
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CarsModule } from './cars/cars.module.js';
import { CatsModule } from './cats/cats.module.js';
import { Cat } from './cats/entities/cat.entity.js';
import { DogsModule } from './dogs/dogs.module.js';
import { HttpExceptionFilter } from './http-exception/http-exception.filter.js';
import { LoggingMiddleware } from './logging/logging.middleware.js';

@Module({
  imports: [

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

     CacheModule.register({
      isGlobal: true,
      ttl: 5000,
       max: 10,

    
    }),
    AuthModule,
    CarsModule,
    CatsModule,
    DogsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
