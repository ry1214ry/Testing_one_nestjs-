// start add the RBAC
// src/auths/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/entities/user.entity.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles from the route handler or controller class
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified on the endpoint, allow access
    if (!requiredRoles) {
      return true;
    }

    // 2. Extract user object from the request (populated by JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // 3. Check if user's role matches any of the required roles
    return requiredRoles.some((role) => user?.role === role);
  }


    
}
