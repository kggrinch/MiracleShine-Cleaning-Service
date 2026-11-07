import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { AuthService, LoginDto, RegisterUserDto } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/v1/auth/register — create a customer account and return a token. */
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  /** POST /api/v1/auth/login — verify credentials and return a signed token. */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** GET /api/v1/auth/me — return the signed-in user's safe profile; bearer token required. */
  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request & { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }
}
