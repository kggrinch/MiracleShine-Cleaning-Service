import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  issueToken(userId: string): string {
    return `demo-${userId}`;
  }

  async register(data: RegisterUserDto) {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (!normalizedEmail || !data.password) {
      throw new BadRequestException('Email and password are required.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: data.phone?.trim() || null,
        role: 'CUSTOMER',
      },
    });

    return {
      token: this.issueToken(user.id),
      user: this.safeUser(user),
    };
  }

  async login(data: LoginDto) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      token: this.issueToken(user.id),
      user: this.safeUser(user),
    };
  }

  async resolveUser(token: string | undefined) {
    if (!token || !token.startsWith('demo-')) {
      return null;
    }

    const userId = token.replace(/^demo-/, '');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user ?? null;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User is not authenticated.');
    }

    return this.safeUser(user);
  }

  safeUser(user: Record<string, any>) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
