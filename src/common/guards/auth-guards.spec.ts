import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AtStrategy } from '../../auth/strategies/at.strategy.js';
import { Role } from '../enums/role.enum.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

const mockContext = (request: Record<string, unknown>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({})],
      providers: [
        JwtAuthGuard,
        AtStrategy,
        {
          provide: ConfigService,
          useValue: { get: () => 'test-at-secret' },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: vi.fn() },
        },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('bypasses authentication for routes marked @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.canActivate(mockContext({ headers: {} }))).toBe(true);
  });

  it('rejects requests without an access token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(
      guard.canActivate(mockContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects requests with an invalid access token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    await expect(
      guard.canActivate(
        mockContext({ headers: { authorization: 'Bearer not-a-jwt' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows requests with a valid access token and attaches the user', async () => {
    const jwtService = new (await import('@nestjs/jwt')).JwtService();
    const token = jwtService.sign(
      { sub: 'u1', email: 'user@example.com', role: Role.USER },
      { secret: 'test-at-secret', expiresIn: 900 },
    );

    reflector.getAllAndOverride.mockReturnValue(false);
    const request: Record<string, unknown> = {
      headers: { authorization: `Bearer ${token}` },
    };
    await expect(
      guard.canActivate(mockContext(request)),
    ).resolves.toBe(true);
    expect(request.user).toMatchObject({
      sub: 'u1',
      email: 'user@example.com',
      role: Role.USER,
    });
  });
});

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
  });

  it('should be defined', () => {
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(guard).toBeDefined();
  });

  it('allows access when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(guard.canActivate(mockContext({}))).toBe(true);
  });

  it('allows access when the user has a required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(
      guard.canActivate(
        mockContext({ user: { sub: 'u1', role: Role.ADMIN } }),
      ),
    ).toBe(true);
  });

  it('denies access when the user role does not match', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(
      guard.canActivate(
        mockContext({ user: { sub: 'u1', role: Role.USER } }),
      ),
    ).toBe(false);
  });

  it('allows access for a USER when either role is allowed', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.USER, Role.ADMIN]);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(
      guard.canActivate(
        mockContext({ user: { sub: 'u1', role: Role.USER } }),
      ),
    ).toBe(true);
  });

  it('throws UnauthorizedException when no user is attached', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const guard = new RolesGuard(reflector as unknown as Reflector);
    expect(() => guard.canActivate(mockContext({}))).toThrow(
      UnauthorizedException,
    );
  });
});