import { Role } from '../enums/role.enum.js';

export interface RequestUser {
  sub: string;
  username: string;
  email: string;
  role: Role;
}