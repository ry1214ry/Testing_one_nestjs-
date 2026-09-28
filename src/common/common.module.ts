import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';

@Global()
@Module({
  imports: [PassportModule.register({})],
  providers: [
    ApiKeyGuard,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [ApiKeyGuard, JwtAuthGuard, RolesGuard],
})
export class CommonModule {}