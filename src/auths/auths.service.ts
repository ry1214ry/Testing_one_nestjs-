// src/auth/auth.service.ts
import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Helper method to generate tokens and save the hashed refresh token
  private async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        expiresIn: '15m', // Short-lived access token
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret',
        expiresIn: '7d',  // Long-lived refresh token
      }),
    ]);

    // Hash the refresh token before saving it to the DB for security
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashedRefreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        this.logger.warn(`Failed login attempt: Email not found -> ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt: Incorrect password for user [ID: ${user.id}]`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User logged in successfully [ID: ${user.id}]`);
      return this.getTokens(user.id, user.email);

    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      const err = error as Error;
      this.logger.error(`Error during login for ${email}: ${err.message}`, err.stack);
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  // Refresh Token Rotation Logic
  async refreshTokens(userId: string, incomingRefreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    // Verify if the incoming refresh token matches the hashed token in the DB
    const refreshTokenMatches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      // SECURITY ALERT: Token theft detection! Clear the token immediately.
      this.logger.warn(`Potential token theft detected for user [ID: ${userId}]! Revoking tokens.`);
      await this.userRepository.update(userId, { refreshToken: null });
      throw new UnauthorizedException('Access Denied');
    }

    // Issue a brand new token pair (Rotation)
    return this.getTokens(user.id, user.email);
  }

  async logout(userId: string) {
    // Clear the refresh token in the database on logout
    await this.userRepository.update(userId, { refreshToken: null });
    this.logger.log(`User logged out successfully [ID: ${userId}]`);
    return { message: 'Logged out successfully' };
  }

  // register method remains unchanged...
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ email, password: hashedPassword });
    await this.userRepository.save(user);
    return { message: 'User registered successfully', userId: user.id };
  }
}


