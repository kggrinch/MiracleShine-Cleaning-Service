import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { AuthService, LoginDto, RegisterUserDto } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request) {
    const token = this.extractToken(req);
    const user = await this.authService.resolveUser(token);

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.authService.getProfile(user.id);
  }

  private extractToken(req: Request): string | undefined {
    const authorization = req.headers.authorization;
    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      return authorization.replace(/^Bearer\s+/i, '');
    }

    const fallback = req.headers['x-user-token'];
    if (typeof fallback === 'string') {
      return fallback;
    }

    if (Array.isArray(fallback) && fallback.length > 0) {
      return fallback[0];
    }

    return undefined;
  }
}
