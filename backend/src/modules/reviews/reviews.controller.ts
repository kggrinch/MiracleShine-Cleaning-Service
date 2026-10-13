import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateReviewDto, ReviewsService, UpdateReviewStatusDto } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findPublic() {
    return this.reviewsService.findPublicReviews();
  }

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }
}

@Controller('admin')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  listAll() {
    return this.reviewsService.findAllAdmin();
  }

  @Patch('reviews/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, dto);
  }
}
