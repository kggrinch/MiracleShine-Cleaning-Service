import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  IsUUID,
  Matches,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

function trimString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/** Validated customer and property details submitted for a cleaning estimate. */
export class CreateQuoteRequestDto {
  @IsUUID()
  serviceId!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerFirstName!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerLastName!: string;

  @Transform(trimString)
  @IsEmail()
  @MaxLength(255)
  customerEmail!: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsEnum(['HOUSE', 'APARTMENT', 'OFFICE', 'OTHER'])
  propertyType!: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  squareFootage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(50)
  bathrooms?: number;

  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  streetAddress!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state!: string;

  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  postalCode!: string;

  @IsOptional()
  @IsDateString({ strict: true })
  preferredDate?: string;

  @IsOptional()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  preferredTime?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateQuoteStatusDto {
  @IsEnum(['PENDING', 'SENT', 'REJECTED'])
  status!: 'PENDING' | 'SENT' | 'REJECTED';
}

export class UpdateQuoteRequestDto extends PartialType(CreateQuoteRequestDto) {}

@Injectable()
/** Handle quote creation, ownership checks, and allowed lifecycle transitions. */
export class QuoteRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List a customer's quotes newest-first, with the associated service. */
  async findCustomerQuotes(userId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });
  }

  /** Fetch a quote only for its owner unless the caller is an administrator. */
  async findOne(id: string, userId?: string, admin = false) {
    const quote = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && (!userId || quote.userId !== userId)) {
      throw new NotFoundException('Quote request not found.');
    }

    return quote;
  }

  /** Resolve an active service and persist a normalized guest or account quote. */
  async create(dto: CreateQuoteRequestDto, userId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || !service.isActive) {
      throw new BadRequestException('The selected service is unavailable.');
    }

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
        streetAddress: dto.streetAddress.trim(),
        city: dto.city.trim(),
        state: dto.state.trim(),
        postalCode: dto.postalCode.trim(),
        preferredDate: dto.preferredDate
          ? new Date(`${dto.preferredDate}T00:00:00.000Z`)
          : null,
        preferredTime: dto.preferredTime
          ? new Date(`1970-01-01T${dto.preferredTime}:00.000Z`)
          : null,
        notes: dto.notes?.trim() || null,
      },
      include: { service: true },
    });
  }

  /** Mark a cancellable quote declined, using a guarded update against stale state. */
  async cancel(id: string, userId?: string, admin = false) {
    const quote = await this.prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && (!userId || quote.userId !== userId)) {
      throw new NotFoundException('Quote request not found.');
    }

    if (quote.status === 'REJECTED') {
      throw new BadRequestException(
        'This quote cannot be cancelled in its current status.',
      );
    }

    // Compare the previously read status in the update to avoid overwriting a
    // concurrent transition performed by another request.
    const result = await this.prisma.quoteRequest.updateMany({
      where: { id, status: quote.status },
      data: { status: 'REJECTED' },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'The quote status changed. Refresh and try again.',
      );
    }
    return this.prisma.quoteRequest.findUnique({
      where: { id },
      include: { service: true },
    });
  }

  /** Enforce ownership/admin permissions and the defined quote-state transition graph. */
  async updateStatus(
    id: string,
    dto: UpdateQuoteStatusDto,
    userId?: string,
    admin = false,
  ) {
    const quote = await this.prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && (!userId || quote.userId !== userId)) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin) {
      throw new UnauthorizedException(
        'Only administrators can update quote status.',
      );
    }

    // Keep allowed lifecycle transitions explicit instead of accepting any
    // enum value as a valid next state.
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['SENT', 'REJECTED'],
      SENT: ['PENDING', 'REJECTED'],
      REJECTED: ['PENDING', 'SENT'],
    };

    const currentStatus = quote.status;
    const validNext = allowedTransitions[currentStatus] ?? [];
    if (!validNext.includes(dto.status)) {
      throw new BadRequestException(
        `Status transition from ${currentStatus} to ${dto.status} is not allowed.`,
      );
    }

    const result = await this.prisma.quoteRequest.updateMany({
      where: { id, status: currentStatus },
      data: { status: dto.status },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'The quote status changed. Refresh and try again.',
      );
    }
    return this.prisma.quoteRequest.findUnique({
      where: { id },
      include: { service: true },
    });
  }

  /** Search quotes for administrators by status, customer email, or service. */
  async findAllAdmin(filters?: {
    status?: string;
    email?: string;
    serviceId?: string;
  }) {
    const where: Record<string, any> = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.email) {
      where.customerEmail = {
        contains: filters.email.trim(),
        mode: 'insensitive',
      };
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    return this.prisma.quoteRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: true,
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
