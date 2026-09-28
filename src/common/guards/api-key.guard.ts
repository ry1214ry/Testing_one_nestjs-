import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

const API_KEY_HEADER = 'x-api-key';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers?.[API_KEY_HEADER];
    const expected = process.env.API_KEY ?? 'dev-api-key';
    return provided === expected;
  }
}