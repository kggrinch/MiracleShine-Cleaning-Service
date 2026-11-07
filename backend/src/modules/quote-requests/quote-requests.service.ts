import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsUUID,
  Matches,
  MaxLength,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

/** Validated customer and property details submitted for a cleaning estimate. */
export class CreateQuoteRequestDto {
  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  serviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  service?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerFirstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerLastName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsEnum(['HOUSE', 'APARTMENT', 'OFFICE', 'OTHER'])
  propertyType!: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  squareFootage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(99)
  bathrooms?: number;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  streetAddress!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state!: string;

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
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateQuoteStatusDto {
  @IsEnum([
    'PENDING',
    'CONTACTED',
    'QUOTED',
    'ACCEPTED',
    'DECLINED',
    'COMPLETED',
  ])
  status!:
    'PENDING' | 'CONTACTED' | 'QUOTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
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
      include: { service: true, appointment: true },
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
    const service = await this.resolveService(dto);
    const preferredDate = dto.preferredDate
      ? new Date(dto.preferredDate)
      : null;
    if (preferredDate && Number.isNaN(preferredDate.getTime())) {
      throw new BadRequestException('Preferred date must be a valid date.');
    }
    const preferredTime = dto.preferredTime
      ? new Date(`1970-01-01T${dto.preferredTime}:00.000Z`)
      : null;
    if (preferredTime && Number.isNaN(preferredTime.getTime())) {
      throw new BadRequestException('Preferred time must be a valid time.');
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
        preferredDate,
        preferredTime,
        notes: dto.notes?.trim() || null,
        status: 'PENDING',
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

    if (quote.status === 'DECLINED' || quote.status === 'COMPLETED') {
      throw new BadRequestException(
        'This quote cannot be cancelled in its current status.',
      );
    }

    // Compare the previously read status in the update to avoid overwriting a
    // concurrent transition performed by another request.
    const result = await this.prisma.quoteRequest.updateMany({
      where: { id, status: quote.status },
      data: { status: 'DECLINED' },
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

    // Keep allowed lifecycle transitions explicit instead of accepting any
    // enum value as a valid next state.
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONTACTED', 'QUOTED', 'DECLINED', 'ACCEPTED', 'COMPLETED'],
      CONTACTED: ['QUOTED', 'DECLINED', 'ACCEPTED', 'COMPLETED'],
      QUOTED: ['ACCEPTED', 'DECLINED', 'COMPLETED'],
      ACCEPTED: ['COMPLETED'],
      DECLINED: [],
      COMPLETED: [],
    };

    if (!admin && dto.status !== 'DECLINED') {
      throw new UnauthorizedException(
        'Only administrators can update quote status.',
      );
    }

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

  /** Resolve either an active service ID or an active service name from the request. */
  private async resolveService(dto: CreateQuoteRequestDto) {
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
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
