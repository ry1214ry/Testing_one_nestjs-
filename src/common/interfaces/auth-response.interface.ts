import { Role } from '../enums/role.enum.js';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
  };
}