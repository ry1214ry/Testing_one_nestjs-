import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { RequestUser } from '../../common/interfaces/request-user.interface.js';
import { Strategy } from 'passport-jwt';

const extractFromBody = (request: Request): string | null => {
  const token: unknown = request.body?.refreshToken;
  return typeof token === 'string' && token.length > 0 ? token : null;
};

export { extractFromBody };

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractFromBody,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_RT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}