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

/** Contact form fields accepted from anonymous or signed-in visitors. */
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
/** Store contact submissions and provide admin review/status operations. */
export class ContactMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Normalize and store a visitor's submission, linking an account when available. */
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

  /** List all submissions newest-first, including limited account details. */
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

  /** Fetch one submission for administrator review or report it as not found. */
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

  /** Update an existing message's handling status and return its linked user. */
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
