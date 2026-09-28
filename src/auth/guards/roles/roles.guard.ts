import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const userRole = request.headers['x-role'];
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Access Denied: You are not an admin!');
    }
    return true;
  }
}
