import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  CreateQuoteRequestDto,
  QuoteRequestsService,
  UpdateQuoteStatusDto,
} from './quote-requests.service.js';

type AuthenticatedRequest = Request & {
  user?: { id: string; role: 'CUSTOMER' | 'ADMIN' };
};

@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  /** POST /api/v1/quote-requests — submit a quote request, optionally associating the signed-in user. */
  @Post()
  @UseGuards(OptionalAuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateQuoteRequestDto) {
    return this.quoteRequestsService.create(dto, req.user?.id);
  }

  /** GET /api/v1/quote-requests/me — list quote requests belonging to the signed-in customer. */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.quoteRequestsService.findCustomerQuotes(userId);
  }

  /** GET /api/v1/quote-requests/:id — fetch an owned quote request, or any request as an admin. */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    return this.quoteRequestsService.findOne(
      id,
      user?.id,
      user?.role === 'ADMIN',
    );
  }

  /** POST /api/v1/quote-requests/:id/cancel — cancel an owned quote request, or any request as an admin. */
  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    return this.quoteRequestsService.cancel(
      id,
      user?.id,
      user?.role === 'ADMIN',
    );
  }
}

@Controller('admin')
export class AdminQuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  /** GET /api/v1/admin/quote-requests?status=&email= — search quote requests; admin bearer token required. */
  @Get('quote-requests')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll(@Query('status') status?: string, @Query('email') email?: string) {
    return this.quoteRequestsService.findAllAdmin({ status, email });
  }

  /** GET /api/v1/admin/quote-requests/:id — fetch a quote request; admin bearer token required. */
  @Get('quote-requests/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  getOne(@Param('id') id: string) {
    return this.quoteRequestsService.findOne(id, undefined, true);
  }

  /** PATCH /api/v1/admin/quote-requests/:id/status — advance quote status; admin bearer token required. */
  @Patch('quote-requests/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quoteRequestsService.updateStatus(id, dto, undefined, true);
  }
}
