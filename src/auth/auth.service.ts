import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from '../common/interfaces/auth-response.interface.js';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface.js';
import { Role } from '../common/enums/role.enum.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from '../users/entities/refresh-token.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { Tokens } from './interfaces/tokens.interface.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const username = dto.username.trim();

<<<<<<< HEAD
    const existingUsername = await this.userRepository.findOneBy({ username });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
=======

  async findOne(id: number):Promise<Auth>{
    const Auth = await this.AuthRepository.findOneBy({ id })
    if (!Auth) {
      throw new NotFoundException(`Auth wiht id ${id} not foud `)
>>>>>>> 69d09cd6460030f44daca8359ce5aa2bd8c174f8
    }

    const existing = await this.userRepository.findOneBy({ email });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userRepository.save(
      this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role: Role.USER,
      }),
    );

    const tokens = await this.generateTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User registered: ${email}`);
    return this.buildAuthResponse(user, tokens);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${email}`);
    return this.buildAuthResponse(user, tokens);
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthResponse> {
    const stored = await this.refreshTokenRepository.findOneBy({
      hashedToken: this.hashToken(refreshToken),
    });

    if (!stored || stored.userId !== userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.isRevoked || new Date(stored.expiresAt).getTime() < Date.now()) {
      await this.revokeAllUserTokens(userId);
      this.logger.warn(
        `Possible refresh token reuse detected for user ${userId}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepository.update(stored.id, { isRevoked: true });

    const tokens = await this.generateTokens(user);
    await this.persistRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`Tokens refreshed for user: ${user.email}`);
    return this.buildAuthResponse(user, tokens);
  }
<<<<<<< HEAD

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, hashedToken: this.hashToken(refreshToken) },
      { isRevoked: true },
    );
    this.logger.log(`User logged out: ${userId}`);
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: 'access',
      jti: randomUUID(),
    };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: 'refresh',
      jti: randomUUID(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_AT_SECRET'),
        expiresIn: this.configService.get<number>('JWT_AT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_RT_SECRET'),
        expiresIn: this.configService.get<number>('JWT_RT_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<RefreshToken> {
    const expiresIn = this.configService.get<number>('JWT_RT_EXPIRES_IN') ?? 604800;
    const record = this.refreshTokenRepository.create({
      userId,
      hashedToken: this.hashToken(refreshToken),
      isRevoked: false,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });
    return this.refreshTokenRepository.save(record);
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId },
      { isRevoked: true },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildAuthResponse(user: User, tokens: Tokens): AuthResponse {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
=======
  
}
>>>>>>> 69d09cd6460030f44daca8359ce5aa2bd8c174f8
