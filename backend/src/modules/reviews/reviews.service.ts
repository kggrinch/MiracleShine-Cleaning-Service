import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

export class CreateReviewDto {
  @IsString()
  appointmentId!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
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
      include: { appointment: { include: { quoteRequest: { include: { service: true } } } } },
    });
  }

  async findAllAdmin() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: { appointment: { include: { quoteRequest: { include: { service: true } } } } },
    });
  }

  async create(dto: CreateReviewDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { appointmentId: dto.appointmentId },
    });

    if (existingReview) {
      throw new BadRequestException('A review already exists for this appointment.');
    }

    return this.prisma.review.create({
      data: {
        appointmentId: dto.appointmentId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        status: 'PENDING',
      },
      include: { appointment: { include: { quoteRequest: { include: { service: true } } } } },
    });
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: { appointment: { include: { quoteRequest: { include: { service: true } } } } },
    });
  }
}
