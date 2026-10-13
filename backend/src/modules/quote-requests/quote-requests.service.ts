import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

export class CreateQuoteRequestDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  service?: string;

  @IsString()
  @MinLength(2)
  customerFirstName!: string;

  @IsString()
  @MinLength(2)
  customerLastName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsEnum(['HOUSE', 'APARTMENT', 'OFFICE', 'OTHER'])
  propertyType!: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  squareFootage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99)
  bathrooms?: number;

  @IsString()
  @MinLength(3)
  streetAddress!: string;

  @IsString()
  @MinLength(2)
  city!: string;

  @IsString()
  @MinLength(2)
  state!: string;

  @IsString()
  @MinLength(3)
  postalCode!: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsString()
  preferredTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQuoteStatusDto {
  @IsEnum(['PENDING', 'CONTACTED', 'QUOTED', 'ACCEPTED', 'DECLINED', 'COMPLETED'])
  status!: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
}

export class UpdateQuoteRequestDto extends PartialType(CreateQuoteRequestDto) {}

@Injectable()
export class QuoteRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicQuotes() {
    return this.prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { service: true, user: true },
    });
  }

  async findCustomerQuotes(userId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });
  }

  async findOne(id: string, userId?: string, admin = false) {
    const quote = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: { service: true, user: true, appointment: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && userId && quote.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this quote request.');
    }

    if (!admin && !userId && quote.userId) {
      throw new UnauthorizedException('You do not have access to this quote request.');
    }

    return quote;
  }

  async create(dto: CreateQuoteRequestDto, userId?: string) {
    const service = await this.resolveService(dto);
    const normalizedStreet = dto.streetAddress.trim();

    return this.prisma.quoteRequest.create({
      data: {
        userId: userId ?? null,
        serviceId: service.id,
        customerFirstName: dto.customerFirstName.trim(),
        customerLastName: dto.customerLastName.trim(),
        customerEmail: dto.customerEmail.trim().toLowerCase(),
        customerPhone: dto.customerPhone?.trim() || null,
        propertyType: dto.propertyType,
        squareFootage: dto.squareFootage ?? null,
        bedrooms: dto.bedrooms ?? null,
        bathrooms: dto.bathrooms !== undefined ? String(dto.bathrooms) : null,
        streetAddress: normalizedStreet,
        city: dto.city.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
        preferredTime: dto.preferredTime ? new Date(`1970-01-01T${dto.preferredTime}:00.000Z`) : null,
        notes: dto.notes?.trim() || null,
        status: 'PENDING',
      },
      include: { service: true },
    });
  }

  async cancel(id: string, userId?: string, admin = false) {
    const quote = await this.prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && userId && quote.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this quote request.');
    }

    if (quote.status === 'DECLINED' || quote.status === 'COMPLETED') {
      throw new BadRequestException('This quote cannot be cancelled in its current status.');
    }

    return this.prisma.quoteRequest.update({
      where: { id },
      data: { status: 'DECLINED' },
      include: { service: true },
    });
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto, userId?: string, admin = false) {
    const quote = await this.prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && userId && quote.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this quote request.');
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONTACTED', 'QUOTED', 'DECLINED', 'ACCEPTED', 'COMPLETED'],
      CONTACTED: ['QUOTED', 'DECLINED', 'ACCEPTED', 'COMPLETED'],
      QUOTED: ['ACCEPTED', 'DECLINED', 'COMPLETED'],
      ACCEPTED: ['COMPLETED'],
      DECLINED: [],
      COMPLETED: [],
    };

    if (!admin && dto.status !== 'DECLINED') {
      throw new UnauthorizedException('Only administrators can update quote status.');
    }

    const currentStatus = quote.status;
    const validNext = allowedTransitions[currentStatus] ?? [];
    if (!validNext.includes(dto.status)) {
      throw new BadRequestException(
        `Status transition from ${currentStatus} to ${dto.status} is not allowed.`,
      );
    }

    return this.prisma.quoteRequest.update({
      where: { id },
      data: { status: dto.status },
      include: { service: true },
    });
  }

  async findAllAdmin(filters?: { status?: string; email?: string; serviceId?: string }) {
    const where: Record<string, any> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.email) {
      where.customerEmail = { contains: filters.email.trim(), mode: 'insensitive' };
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    return this.prisma.quoteRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { service: true, user: true },
    });
  }

  private async resolveService(dto: CreateQuoteRequestDto) {
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
      if (!service || !service.isActive) {
        throw new BadRequestException('The selected service is unavailable.');
      }
      return service;
    }

    if (dto.service) {
      const service = await this.prisma.service.findFirst({
        where: {
          name: {
            equals: dto.service.trim(),
            mode: 'insensitive',
          },
          isActive: true,
        },
      });

      if (!service) {
        throw new BadRequestException('The selected service is unavailable.');
      }

      return service;
    }

    throw new BadRequestException('A valid service is required.');
  }
}
