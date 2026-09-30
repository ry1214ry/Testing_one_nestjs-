import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 1. Added this import
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auths/auths.module.js';
import { DogsModule } from './dogs/dogs.module.js';

@Module({
  imports: [

    // 👈 2. Added this block to load your .env file globally!
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Xanji!@#3210',
      database: 'lessone7day', // (Make sure your db credentials are correct here!)
      autoLoadEntities: true,
      synchronize: true,
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
      max: 10,
    }),

    AuthModule,
    DogsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    
  }
}
