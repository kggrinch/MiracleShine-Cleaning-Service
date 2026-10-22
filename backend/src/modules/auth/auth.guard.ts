import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const token = this.extractToken(req);
    const user = await this.authService.resolveUser(token);

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    req.user = user;
    return true;
  }

  private extractToken(req: Request): string | undefined {
    const authorization = req.headers.authorization;
    if (
      typeof authorization === 'string' &&
      /^Bearer\s+/i.test(authorization)
    ) {
      return authorization.replace(/^Bearer\s+/i, '');
    }

    return undefined;
  }
}
