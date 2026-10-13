import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UpdateUserDto, UsersService } from './users.service.js';

type AuthenticatedRequest = Request & {
  user?: { id?: string; role?: string };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.usersService.findMe(userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    const userId = this.extractUserId(req);
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.usersService.updateMe(userId, dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getUser(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    const userId = user?.id;
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (userId !== paramId && user?.role !== 'ADMIN') {
      throw new NotFoundException('User not found.');
    }

    return this.usersService.findOne(paramId);
  }

  private extractUserId(req: AuthenticatedRequest): string | undefined {
    const xUserId = req.headers['x-user-id'];
    if (typeof xUserId === 'string') {
      return xUserId;
    }

    if (Array.isArray(xUserId) && xUserId.length > 0) {
      return xUserId[0];
    }

    const auth = req.headers.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      return auth.replace(/^Bearer\s+/i, '').replace(/^demo-/, '');
    }

    return req.user?.id;
  }
}
