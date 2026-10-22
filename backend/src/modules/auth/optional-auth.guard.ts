import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';

type AuthenticatedRequest = Request & {
  user?: { id: string; role: string; isActive: boolean };
};

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const token =
      typeof authorization === 'string' && /^Bearer\s+/i.test(authorization)
        ? authorization.replace(/^Bearer\s+/i, '')
        : undefined;

    if (!token) return true;

    const user = await this.authService.resolveUser(token);
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    request.user = user;
    return true;
  }
}
