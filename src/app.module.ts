import { CacheModule } from '@nestjs/cache-manager'; // 💾 Fixed: Added missing import
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { AuthModule } from './auths/auths.module.js';
import { CatsModule } from './cats/cats.module.js';
import { Cat } from './cats/entities/cat.entity.js';

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Xanji!@#3210',
      database: 'lessone7day',
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
    CatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
  }
}
