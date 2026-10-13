jest.mock('../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../src/modules/auth/auth.service.js';

describe('AuthService', () => {
  let prisma: any;
  let service: AuthService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new AuthService(prisma);
  });

  it('registers a new customer account and returns a safe user payload', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ava',
      lastName: 'Smith',
      email: 'ava@example.com',
      passwordHash: 'hashed-password',
      phone: '425-555-0101',
      role: 'CUSTOMER',
      isActive: true,
    });

    const result = await service.register({
      firstName: 'Ava',
      lastName: 'Smith',
      email: 'ava@example.com',
      password: 'Password123!',
      phone: '425-555-0101',
    });

    expect(prisma.user.create).toHaveBeenCalled();
    expect(result.token).toBe('demo-user-1');
    expect(result.user.email).toBe('ava@example.com');
    expect(result.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate emails during registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        firstName: 'Ava',
        lastName: 'Smith',
        email: 'ava@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects login attempts with an invalid password', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'ava@example.com',
      passwordHash: '$2b$12$h7f7Jop07n8D1KYOHnXPnOeE',
    });

    await expect(
      service.login({ email: 'ava@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
