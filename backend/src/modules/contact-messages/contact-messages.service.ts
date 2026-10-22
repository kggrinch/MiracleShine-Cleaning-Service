import { Injectable, NotFoundException } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

export class CreateContactMessageDto {
  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(2)
  subject!: string;

  @IsString()
  @MinLength(10)
  message!: string;
}

export class UpdateContactMessageStatusDto {
  @IsEnum(['NEW', 'READ', 'RESPONDED', 'CLOSED'])
  status!: 'NEW' | 'READ' | 'RESPONDED' | 'CLOSED';
}

export class UpdateContactMessageDto extends PartialType(
  CreateContactMessageDto,
) {}

@Injectable()
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactMessageDto, userId?: string) {
    const message = await this.prisma.contactMessage.create({
      data: {
        userId: userId ?? null,
        customerName: dto.customerName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        status: 'NEW',
      },
    });

    return message;
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Contact message not found.');
    }

    return message;
  }

  async updateStatus(id: string, dto: UpdateContactMessageStatusDto) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!message) {
      throw new NotFoundException('Contact message not found.');
    }

    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
