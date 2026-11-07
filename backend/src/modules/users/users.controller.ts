import {
  Body,
  Controller,
  Get,
  Post,
  NotFoundException,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  CreateAdminDto,
  UpdateUserDto,
  UsersService,
} from './users.service.js';

type AuthenticatedRequest = Request & {
  user?: { id: string; role: 'CUSTOMER' | 'ADMIN' };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/v1/users/me — return the authenticated user's profile. */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.usersService.findMe(userId);
  }

  /** PATCH /api/v1/users/me — update the authenticated user's profile fields. */
  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.usersService.updateMe(userId, dto);
  }

  /** GET /api/v1/users/:id — fetch the caller's own profile or any profile as an admin. */
  @Get(':id')
  @UseGuards(AuthGuard)
  async getUser(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const userId = user?.id;
    const paramId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (userId !== paramId && user?.role !== 'ADMIN') {
      throw new NotFoundException('User not found.');
    }

    return this.usersService.findOne(paramId);
  }

  /** POST /api/v1/users/admin — create an administrator; admin bearer token required. */
  @Post('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.usersService.createAdmin(dto);
  }
}
