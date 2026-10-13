import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  AppointmentsService,
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './appointments.service.js';

type AuthenticatedRequest = Request & {
  user?: { id?: string; role?: string };
};

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
    const userId = this.extractUserId(req);
    return this.appointmentsService.create(dto, userId);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.appointmentsService.findCustomerAppointments(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    const admin = this.isAdmin(req);
    return this.appointmentsService.findById(id, userId, admin);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = this.extractUserId(req);
    const admin = this.isAdmin(req);
    return this.appointmentsService.cancel(id, userId, admin);
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
export class AdminAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('appointments')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll() {
    return this.appointmentsService.findAllAdmin();
  }

  @Patch('appointments/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto, true);
  }
}
