import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: Role;
  type?: 'access' | 'refresh';
  jti?: string;
  iat?: number;
  exp?: number;
}