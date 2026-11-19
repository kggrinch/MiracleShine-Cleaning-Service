import { Injectable, NotFoundException } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';
/** Independent review content rated from one to five. */
export class CreateReviewDto {
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
/** Manage review submission and moderation; only approved reviews are public. */
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Return only approved reviews for display on public pages. */
  async findPublicReviews() {
    return this.prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  /** Return every review, including pending and rejected entries, for moderation. */
  async findAllAdmin() {
    return this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /** Return only the authenticated customer's reviews. */
  async findMine(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Create an independent pending review for the authenticated customer. */
  async create(dto: CreateReviewDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.review.create({
      data: {
        userId,
        customerName: `${user.firstName} ${user.lastName}`.trim(),
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        status: 'PENDING',
      },
    });
  }

  /** Change an existing review's moderation status. */
  async updateStatus(id: string, dto: UpdateReviewStatusDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
