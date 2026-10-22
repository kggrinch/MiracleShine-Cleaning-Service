import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-errors.js';

export class CreateReviewDto {
  @IsUUID()
  appointmentId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;
}

export class UpdateReviewStatusDto {
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status!: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicReviews() {
    return this.prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: { quoteRequest: { include: { service: true } } },
        },
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: { quoteRequest: { include: { service: true } } },
        },
      },
    });
  }

  async create(dto: CreateReviewDto, userId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      select: {
        id: true,
        status: true,
        quoteRequest: { select: { userId: true } },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (appointment.quoteRequest.userId !== userId) {
      throw new NotFoundException('Appointment not found.');
    }
    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Reviews can only be submitted for completed appointments.',
      );
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingReview) {
      throw new BadRequestException(
        'A review already exists for this appointment.',
      );
    }

    try {
      return await this.prisma.review.create({
        data: {
          appointmentId: dto.appointmentId,
          rating: dto.rating,
          comment: dto.comment?.trim() || null,
          status: 'PENDING',
        },
        include: {
          appointment: {
            include: { quoteRequest: { include: { service: true } } },
          },
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'A review already exists for this appointment.',
        );
      }
      throw error;
    }
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: {
        appointment: {
          include: { quoteRequest: { include: { service: true } } },
        },
      },
    });
  }
}
