import { Module } from '@nestjs/common';
import {
  AdminReviewsController,
  ReviewsController,
} from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { AuthModule } from '../auth/auth.module.js';

/** Register public review submission and protected moderation routes. */
@Module({
  imports: [AuthModule],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
