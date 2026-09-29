// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auths.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

 // src/auth/auth.controller.ts
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refreshTokens(@Req() req: any) { // <-- Added ': any' here
    const user = req.user;
    return this.authService.refreshTokens(user.userId, user.refreshToken);
  }

  // In auth.controller.ts
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  logout(@Req() req: any) { // <-- Explicitly type req as any
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }
}
