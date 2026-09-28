import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { AuthDto } from './dto/auth.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 1. Sign Up a New User
  async register(authDto: AuthDto) {
    const { username, password } = authDto;

    // Check if username already exists
    const existingUser = await this.userRepo.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('Username already taken!');
    }

    // 🔒 Hash the password (salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Default the first user to admin for easy practice testing
    const role = username === 'admin' ? 'admin' : 'user';
    const user = this.userRepo.create({ username, passwordHash, role });
    await this.userRepo.save(user);
      return { message: 'User registered successfully!' };



  }
  // 2. Log In an Existing User
  async login(authDto: AuthDto) {
    const { username, password } = authDto;
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 🔑 Verify if the typed password matches the database hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // 🎟️ Generate a secure JWT ticket containing user data
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
