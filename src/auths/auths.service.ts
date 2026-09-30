// src/auth/auth.service.ts
import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role, User } from '../users/entities/user.entity.js';
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


  async onModuleInit() {
    // 1. Read securely from environment variables (with fallback defaults if missing)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nestjs.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    // 2. Check if this admin account already exists in the database
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      // 3. Hash the password securely using bcrypt
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 4. Create and save the admin record with Role.ADMIN
      const admin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN, // Forces the RBAC admin role
      });

      await this.userRepository.save(admin);
      console.log(`🛡️ Secure Admin Account Provisioned: ${adminEmail}`);
    }
  }

  private async getTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

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

  async refreshTokens(userId: string, incomingRefreshToken: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      this.logger.warn(`Potential token theft detected for user [ID: ${userId}]! Revoking tokens.`);
      await this.userRepository.update(userId, { refreshToken: null });
      throw new UnauthorizedException('Access Denied');
    }
    return this.getTokens(user.id, user.email);
  }

  async logout(userId: string) {

    await this.userRepository.update(userId, { refreshToken: null });
    this.logger.log(`User logged out successfully [ID: ${userId}]`);
    return { message: 'Logged out successfully' };
  }

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


