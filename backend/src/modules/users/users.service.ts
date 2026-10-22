import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-errors.js';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/\S/)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/\S/)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/\S/)
  password!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.safeUser(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const normalizedEmail = dto.email?.trim().toLowerCase();
    if (normalizedEmail && normalizedEmail !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('That email is already in use.');
      }
    }

    try {
      const next = await this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: dto.firstName?.trim() || undefined,
          lastName: dto.lastName?.trim() || undefined,
          phone: dto.phone?.trim() || undefined,
          email: normalizedEmail,
        },
      });

      return this.safeUser(next);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException('That email is already in use.');
      }
      throw error;
    }
  }

  async findAll() {
    return (
      await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })
    ).map((user) => this.safeUser(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.safeUser(user);
  }

  async createAdmin(dto: CreateAdminDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email,
          passwordHash,
          role: 'ADMIN',
        },
      });
      return this.safeUser(user);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'An account with that email already exists.',
        );
      }
      throw error;
    }
  }

  safeUser<T extends { passwordHash: string }>(
    user: T,
  ): Omit<T, 'passwordHash'> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => key !== 'passwordHash'),
    ) as Omit<T, 'passwordHash'>;
  }
}
