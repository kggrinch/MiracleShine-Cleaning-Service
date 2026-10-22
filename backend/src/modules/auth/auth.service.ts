import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-errors.js';

const TOKEN_LIFETIME_SECONDS = 60 * 60;

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/\S/)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Matches(/\S/)
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

type TokenClaims = {
  sub: string;
  iat: number;
  exp: number;
};

type UserRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SafeUser = Omit<UserRecord, 'passwordHash'>;

type AuthenticatedUser = Pick<UserRecord, 'id' | 'role' | 'isActive'>;

@Injectable()
export class AuthService {
  private readonly jwtSecret: Buffer;

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;
    if (
      !secret ||
      Buffer.byteLength(secret) < 32 ||
      secret === 'replace-with-a-long-random-secret'
    ) {
      throw new Error(
        'JWT_SECRET must be configured with at least 32 random bytes.',
      );
    }
    this.jwtSecret = Buffer.from(secret, 'utf8');
  }

  issueToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        iat: now,
        exp: now + TOKEN_LIFETIME_SECONDS,
      }),
    ).toString('base64url');
    const unsignedToken = `${header}.${payload}`;

    return `${unsignedToken}.${this.sign(unsignedToken)}`;
  }

  async register(
    data: RegisterUserDto,
  ): Promise<{ token: string; user: SafeUser }> {
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
    try {
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
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'An account with that email already exists.',
        );
      }
      throw error;
    }
  }

  async login(data: LoginDto): Promise<{ token: string; user: SafeUser }> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return {
      token: this.issueToken(user.id),
      user: this.safeUser(user),
    };
  }

  async resolveUser(
    token: string | undefined,
  ): Promise<AuthenticatedUser | null> {
    if (!token) return null;

    const claims = this.verifyToken(token);
    if (!claims) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    return user?.isActive ? user : null;
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is not authenticated.');
    }

    return user;
  }

  safeUser(user: UserRecord): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private verifyToken(token: string): TokenClaims | null {
    const parts = token.split('.');
    if (
      parts.length !== 3 ||
      parts.some((part) => !part || !/^[A-Za-z0-9_-]+$/.test(part))
    ) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = Buffer.from(
      this.sign(unsignedToken),
      'base64url',
    );
    const receivedSignature = Buffer.from(signature, 'base64url');
    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return null;
    }

    try {
      const header: unknown = JSON.parse(
        Buffer.from(encodedHeader, 'base64url').toString('utf8'),
      );
      const payload: unknown = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      );
      if (
        typeof header !== 'object' ||
        header === null ||
        !('alg' in header) ||
        header.alg !== 'HS256' ||
        typeof payload !== 'object' ||
        payload === null ||
        !('sub' in payload) ||
        typeof payload.sub !== 'string' ||
        !payload.sub ||
        !('iat' in payload) ||
        typeof payload.iat !== 'number' ||
        !('exp' in payload) ||
        typeof payload.exp !== 'number' ||
        payload.exp <= Math.floor(Date.now() / 1000) ||
        payload.iat > Math.floor(Date.now() / 1000)
      ) {
        return null;
      }
      return payload as TokenClaims;
    } catch {
      return null;
    }
  }

  private sign(value: string): string {
    return createHmac('sha256', this.jwtSecret)
      .update(value)
      .digest('base64url');
  }
}
