jest.mock('../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import bcrypt from 'bcrypt';
import { createHmac } from 'node:crypto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service.js';
import { AuthService } from '../../../src/modules/auth/auth.service.js';

type TestUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  passwordHash?: string;
  phone?: string | null;
  role?: string;
  isActive?: boolean;
};

type UserFindUniqueArgs = {
  where: { id?: string; email?: string };
  select?: Record<string, boolean>;
};

type UserCreateArgs = { data: Record<string, unknown> };

describe('AuthService', () => {
  let prisma: {
    user: {
      findUnique: jest.MockedFunction<
        (args: UserFindUniqueArgs) => Promise<TestUser | null>
      >;
      create: jest.MockedFunction<(args: UserCreateArgs) => Promise<TestUser>>;
    };
  };
  let service: AuthService;

  beforeEach(() => {
    process.env.JWT_SECRET = 'unit-test-jwt-secret-that-is-at-least-32-bytes';
    prisma = {
      user: {
        findUnique: jest.fn(
          (args: UserFindUniqueArgs): Promise<TestUser | null> => {
            void args;
            return Promise.resolve(null);
          },
        ),
        create: jest.fn((args: UserCreateArgs): Promise<TestUser> => {
          void args;
          return Promise.resolve({ id: 'created-user' });
        }),
      },
    };

    service = new AuthService(prisma as unknown as PrismaService);
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

    const result = await service.register(
      Object.assign(
        {
          firstName: 'Ava',
          lastName: 'Smith',
          email: 'ava@example.com',
          password: 'Password123!',
          phone: '425-555-0101',
        },
        { role: 'ADMIN' },
      ),
    );

    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.create.mock.calls[0]?.[0].data.role).toBe('CUSTOMER');
    expect(result.token.split('.')).toHaveLength(3);
    expect(result.user.email).toBe('ava@example.com');
    expect(result.user).not.toHaveProperty('passwordHash');
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
    const passwordHash = await bcrypt.hash('correct-password', 4);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'ava@example.com',
      passwordHash,
      isActive: true,
    });

    await expect(
      service.login({ email: 'ava@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects tokens with an invalid signature and expired tokens', async () => {
    const token = service.issueToken('user-1');
    const [header, payload] = token.split('.');

    await expect(
      service.resolveUser(`${header}.${payload}.invalid`),
    ).resolves.toBeNull();

    const expiredPayload = Buffer.from(
      JSON.stringify({ sub: 'user-1', iat: 1, exp: 2 }),
    ).toString('base64url');
    const unsigned = `${header}.${expiredPayload}`;
    const signature = createHmac('sha256', process.env.JWT_SECRET as string)
      .update(unsigned)
      .digest('base64url');
    const invalidExpiredToken = `${unsigned}.${signature}`;
    await expect(service.resolveUser(invalidExpiredToken)).resolves.toBeNull();
  });

  it('does not resolve inactive users', async () => {
    const token = service.issueToken('inactive-user');
    prisma.user.findUnique.mockResolvedValue({
      id: 'inactive-user',
      isActive: false,
    });

    await expect(service.resolveUser(token)).resolves.toBeNull();
  });
});
