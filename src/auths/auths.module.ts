// src/auths/auths.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { AuthController } from './auths.controller.js';
import { AuthService } from './auths.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // <-- Must be here so NestJS registers the 'jwt' strategy!
    JwtStrategy,  // <-- Registers the 'jwt-refresh' strategy
  ],
  exports: [
    AuthService,
    JwtStrategy,
  ],
})
export class AuthModule { }

