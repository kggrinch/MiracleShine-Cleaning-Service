import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

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

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
      });
      if (existingUser) {
        throw new ConflictException('That email is already in use.');
      }
    }

    const next = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName?.trim() || undefined,
        lastName: dto.lastName?.trim() || undefined,
        phone: dto.phone?.trim() || undefined,
        email: dto.email ? dto.email.trim().toLowerCase() : undefined,
      },
    });

    return this.safeUser(next);
  }

  async findAll() {
    return (await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })).map((user) => this.safeUser(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.safeUser(user);
  }

  safeUser(user: Record<string, any>) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
