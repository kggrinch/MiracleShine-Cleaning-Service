import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  CreateReviewDto,
  ReviewsService,
  UpdateReviewStatusDto,
} from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findPublic() {
    return this.reviewsService.findPublicReviews();
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(dto, req.user.id);
  }
}

@Controller('admin')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll() {
    return this.reviewsService.findAllAdmin();
  }

  @Patch('reviews/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, dto);
  }
}
