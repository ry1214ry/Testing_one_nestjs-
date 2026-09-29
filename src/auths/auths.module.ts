// src/auths/auths.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { AuthController } from './auths.controller.js';
import { AuthService } from './auths.service.js';
import { RtStrategy } from './strategies/jwt.strategy.js';



@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RtStrategy, // <-- TypeScript will now recognize this!
    RtStrategy,  // <-- And this!
  ],
  
  exports: [AuthService],
})
export class AuthModule {}
