jest.mock('../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../../../src/modules/auth/auth.guard.js';
import { AuthService } from '../../../src/modules/auth/auth.service.js';
import { RolesGuard } from '../../../src/modules/auth/roles.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: { resolveUser: jest.Mock };

  beforeEach(async () => {
    authService = { resolveUser: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [AuthGuard, { provide: AuthService, useValue: authService }],
    }).compile();
    guard = module.get(AuthGuard);
  });

  function contextFor(headers: Record<string, string>) {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers,
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as ExecutionContext;
    return { context, request };
  }

  it('rejects requests without a resolvable token', async () => {
    authService.resolveUser.mockResolvedValue(null);
    const { context } = contextFor({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(authService.resolveUser).toHaveBeenCalledWith(undefined);
  });

  it('resolves the bearer token and attaches its user to the request', async () => {
    const user = { id: 'user-1', role: 'CUSTOMER' };
    authService.resolveUser.mockResolvedValue(user);
    const { context, request } = contextFor({
      authorization: 'Bearer demo-user-1',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.resolveUser).toHaveBeenCalledWith('demo-user-1');
    expect(request.user).toBe(user);
  });
});

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: reflector }],
    }).compile();
    guard = module.get(RolesGuard);
  });

  function contextFor(user?: { role?: string }): ExecutionContext {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as ExecutionContext;
    return context;
  }

  it('allows routes without role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor())).toBe(true);
  });

  it('allows a required role and rejects a different role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);

    expect(guard.canActivate(contextFor({ role: 'ADMIN' }))).toBe(true);
    expect(() => guard.canActivate(contextFor({ role: 'CUSTOMER' }))).toThrow(
      ForbiddenException,
    );
  });
});
