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
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  CreateQuoteRequestDto,
  QuoteRequestsService,
  UpdateQuoteStatusDto,
} from './quote-requests.service.js';

type AuthenticatedRequest = Request & {
  user?: { id?: string; role?: string };
};

@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateQuoteRequestDto) {
    const userId = this.extractUserId(req);
    return this.quoteRequestsService.create(dto, userId);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.quoteRequestsService.findCustomerQuotes(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    return this.quoteRequestsService.findOne(id, userId, false);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    const admin = this.isAdmin(req);
    return this.quoteRequestsService.cancel(id, userId, admin);
  }

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    const xUserId = req.headers['x-user-id'];
    if (typeof xUserId === 'string') return xUserId;
    if (Array.isArray(xUserId) && xUserId.length > 0) return xUserId[0];

    const auth = req.headers.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      return auth.replace(/^Bearer\s+/i, '').replace(/^demo-/, '');
    }

    return req.user?.id;
  }

  private isAdmin(req: AuthenticatedRequest): boolean {
    const role = req.user?.role ?? req.headers['x-user-role'];
    return typeof role === 'string' ? role === 'ADMIN' : false;
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
