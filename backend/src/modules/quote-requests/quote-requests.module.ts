import { Module } from '@nestjs/common';
import {
  AdminQuoteRequestsController,
  QuoteRequestsController,
} from './quote-requests.controller.js';
import { QuoteRequestsService } from './quote-requests.service.js';

@Module({
  controllers: [QuoteRequestsController, AdminQuoteRequestsController],
  providers: [QuoteRequestsService],
})
export class QuoteRequestsModule {}
