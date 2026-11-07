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
  user?: { id: string; role: 'CUSTOMER' | 'ADMIN' };
};

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** POST /api/v1/appointments — book a quote request owned by the caller; admins may book any request. */
  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAppointmentDto) {
    const user = req.user;
    return this.appointmentsService.create(
      dto,
      user?.id,
      user?.role === 'ADMIN',
    );
  }

  /** GET /api/v1/appointments/me — list appointments belonging to the signed-in customer. */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMine(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.appointmentsService.findCustomerAppointments(userId);
  }

  /** GET /api/v1/appointments/:id — fetch an owned appointment, or any appointment as an admin. */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    return this.appointmentsService.findById(
      id,
      user?.id,
      user?.role === 'ADMIN',
    );
  }

  /** POST /api/v1/appointments/:id/cancel — cancel an owned appointment, or any appointment as an admin. */
  @Post(':id/cancel')
  @UseGuards(AuthGuard)
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const user = req.user;
    return this.appointmentsService.cancel(
      id,
      user?.id,
      user?.role === 'ADMIN',
    );
  }
}

@Controller('admin')
export class AdminAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** GET /api/v1/admin/appointments — list all appointments; admin bearer token required. */
  @Get('appointments')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll() {
    return this.appointmentsService.findAllAdmin();
  }

  /** PATCH /api/v1/admin/appointments/:id/status — change appointment status; admin bearer token required. */
  @Patch('appointments/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, dto, true);
  }
}
