import { Module } from '@nestjs/common';
import {
  AdminQuoteRequestsController,
  QuoteRequestsController,
} from './quote-requests.controller.js';
import { QuoteRequestsService } from './quote-requests.service.js';
import { AuthModule } from '../auth/auth.module.js';

/** Register customer quote workflows and protected administrator workflows. */
@Module({
  imports: [AuthModule],
  controllers: [QuoteRequestsController, AdminQuoteRequestsController],
  providers: [QuoteRequestsService],
})
export class QuoteRequestsModule {}
