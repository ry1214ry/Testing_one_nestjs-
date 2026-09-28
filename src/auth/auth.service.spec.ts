import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../common/enums/role.enum.js';
import { RefreshToken } from '../users/entities/refresh-token.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn().mockResolvedValue(true),
}));

vi.mock('bcrypt', () => bcryptMock);

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: {
    findOneBy: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let refreshRepo: {
    findOneBy: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  const userFixture = {
    id: '44bf3ded-94b3-4a33-9d2b-5fd98fc6d83c',
    username: 'john_doe',
    email: 'test@example.com',
    role: Role.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOneBy: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: vi.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(
              (key: string) =>
                ({
                  BCRYPT_SALT_ROUNDS: 10,
                  JWT_AT_SECRET: 'at-secret',
                  JWT_RT_SECRET: 'rt-secret',
                  JWT_AT_EXPIRES_IN: 900,
                  JWT_RT_EXPIRES_IN: 604800,
                } as Record<string, unknown>)[key],
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    refreshRepo = module.get(getRepositoryToken(RefreshToken));
    jwtService = module.get(JwtService);

    vi.clearAllMocks();
    bcryptMock.hash.mockResolvedValue('hashed');
    bcryptMock.compare.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('register', () => {
    it('hashes the password and creates a user with the USER role', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      const created = { ...userFixture };
      userRepo.create.mockReturnValue(created);
      userRepo.save.mockResolvedValue(created);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.register({
        username: ' John_Doe ',
        email: '  Test@EXAMPLE.com ',
        password: 'Str0ngPass123',
      });

      expect(bcryptMock.hash).toHaveBeenCalledWith('Str0ngPass123', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'John_Doe',
        email: 'test@example.com',
        password: 'hashed',
        role: Role.USER,
      });
      expect(userRepo.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('token');
      expect(result.refreshToken).toBe('token');
      expect(result.user.username).toBe('john_doe');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(Role.USER);
    });

    it('stores a hashed refresh token record', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      const created = { ...userFixture };
      userRepo.create.mockReturnValue(created);
      userRepo.save.mockResolvedValue(created);
      jwtService.signAsync.mockResolvedValue('raw-refresh-token');

      refreshRepo.create.mockImplementation((record: Partial<RefreshToken>) => record as RefreshToken);

      await service.register({
        username: 'john_doe',
        email: 'test@example.com',
        password: 'Str0ngPass123',
      });

      expect(refreshRepo.save).toHaveBeenCalledTimes(1);
      const record = refreshRepo.save.mock.calls[0][0];
      expect(record.userId).toBe(userFixture.id);
      expect(record.hashedToken).not.toBe('raw-refresh-token');
      expect(record.isRevoked).toBe(false);
      expect(record.expiresAt).toBeInstanceOf(Date);
    });

    it('throws ConflictException when the username already exists', async () => {
      userRepo.findOneBy
        .mockResolvedValueOnce({ ...userFixture })
        .mockResolvedValueOnce(null);

      await expect(
        service.register({
          username: 'john_doe',
          email: 'other@example.com',
          password: 'Str0ngPass123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the email already exists', async () => {
      userRepo.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...userFixture });

      await expect(
        service.register({
          username: 'new_user',
          email: 'test@example.com',
          password: 'Str0ngPass123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token pair for valid credentials', async () => {
      const queryBuilder = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue({ ...userFixture, password: 'hashed' }),
      };
      userRepo.createQueryBuilder.mockReturnValue(queryBuilder);
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.login({
        email: 'test@example.com',
        password: 'Str0ngPass123',
      });

      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(bcryptMock.compare).toHaveBeenCalledWith('Str0ngPass123', 'hashed');
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(refreshRepo.save).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('token');
    });

    it('throws a generic UnauthorizedException for a wrong password', async () => {
      bcryptMock.compare.mockResolvedValue(false);
      const queryBuilder = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue({ ...userFixture, password: 'hashed' }),
      };
      userRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('throws a generic UnauthorizedException when the user does not exist', async () => {
      const queryBuilder = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };
      userRepo.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'Whatever123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rotates the token and invalidates the old record', async () => {
      const stored = {
        id: 'rt-1',
        userId: userFixture.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60),
      };
      refreshRepo.findOneBy.mockResolvedValue(stored);
      userRepo.findOneBy.mockResolvedValue({ ...userFixture });
      refreshRepo.create.mockReturnValue({ ...stored, id: 'rt-2' });
      jwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refresh(userFixture.id, 'any-refresh-token');

      expect(refreshRepo.update).toHaveBeenCalledWith('rt-1', {
        isRevoked: true,
      });
      expect(refreshRepo.save).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('new-token');
    });

    it('throws UnauthorizedException when the token record is missing', async () => {
      refreshRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.refresh(userFixture.id, 'unknown-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the record belongs to another user', async () => {
      refreshRepo.findOneBy.mockResolvedValue({
        id: 'rt-1',
        userId: 'someone-else',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60),
      });

      await expect(
        service.refresh(userFixture.id, 'someoneelses-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('revokes all tokens and throws on reuse of an already rotated token', async () => {
      refreshRepo.findOneBy.mockResolvedValue({
        id: 'rt-1',
        userId: userFixture.id,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000 * 60),
      });

      await expect(
        service.refresh(userFixture.id, 'reused-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshRepo.update).toHaveBeenCalledWith(
        { userId: userFixture.id },
        { isRevoked: true },
      );
    });

    it('throws UnauthorizedException when the token has expired', async () => {
      refreshRepo.findOneBy.mockResolvedValue({
        id: 'rt-1',
        userId: userFixture.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.refresh(userFixture.id, 'expired-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('revokes the presented refresh token', async () => {
      refreshRepo.update.mockResolvedValue({ affected: 1 });

      await service.logout(userFixture.id, 'any-refresh-token');

      const [criteria, change] = refreshRepo.update.mock.calls[0];
      expect(criteria.userId).toBe(userFixture.id);
      expect(criteria.hashedToken).not.toBe('any-refresh-token');
      expect(change).toEqual({ isRevoked: true });
    });
  });
});