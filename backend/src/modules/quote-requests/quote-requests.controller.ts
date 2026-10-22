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

  @Post()
  @UseGuards(OptionalAuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateQuoteRequestDto) {
    return this.quoteRequestsService.create(dto, req.user?.id);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.quoteRequestsService.findCustomerQuotes(userId);
  }

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

  @Get('quote-requests')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll(@Query('status') status?: string, @Query('email') email?: string) {
    return this.quoteRequestsService.findAllAdmin({ status, email });
  }

  @Get('quote-requests/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  getOne(@Param('id') id: string) {
    return this.quoteRequestsService.findOne(id, undefined, true);
  }

  @Patch('quote-requests/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quoteRequestsService.updateStatus(id, dto, undefined, true);
  }
}
