<<<<<<< HEAD
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
=======
import { CacheModule } from '@nestjs/cache-manager'; // 💾 Fixed: Added missing import
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
>>>>>>> 69d09cd6460030f44daca8359ce5aa2bd8c174f8
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CarsModule } from './cars/cars.module.js';
import { CatsModule } from './cats/cats.module.js';
import { CommonModule } from './common/common.module.js';
import { validateEnvironment } from './common/config/env.validation.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { DogsModule } from './dogs/dogs.module.js';
<<<<<<< HEAD
import { PeoplesModule } from './peoples/peoples.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: ['error', 'warn'],
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL') ?? 60,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 10,
          },
        ],
      }),
    }),
    CommonModule,
=======
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
>>>>>>> 69d09cd6460030f44daca8359ce5aa2bd8c174f8
    AuthModule,
    UsersModule,
    CarsModule,
    CatsModule,
    DogsModule,
    PeoplesModule,
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
<<<<<<< HEAD
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
=======
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
>>>>>>> 69d09cd6460030f44daca8359ce5aa2bd8c174f8
