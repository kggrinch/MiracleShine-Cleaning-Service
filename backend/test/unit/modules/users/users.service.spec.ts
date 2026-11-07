jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { UsersService } from '../../../../src/modules/users/users.service.js';

const createPrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
});

describe('UsersService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: UsersService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it('returns a user profile without the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'ava@example.com',
      passwordHash: 'secret-hash',
    });

    await expect(service.findMe('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'ava@example.com',
    });
  });

  it('rejects missing users when reading or updating their profile', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findMe('missing')).rejects.toThrow(NotFoundException);
    await expect(
      service.updateMe('missing', { firstName: 'Ava' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('normalizes the email and name when updating a profile', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ava@example.com',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ava',
      email: 'new@example.com',
      passwordHash: 'secret-hash',
    });

    await service.updateMe('user-1', {
      firstName: ' Ava ',
      email: ' NEW@EXAMPLE.COM ',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        firstName: 'Ava',
        lastName: undefined,
        phone: undefined,
        email: 'new@example.com',
      },
    });
  });

  it('rejects an email already owned by another user', async () => {
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'user-1', email: 'ava@example.com' })
      .mockResolvedValueOnce({ id: 'user-2' });

    await expect(
      service.updateMe('user-1', { email: 'other@example.com' }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('allows case-only email changes without treating the current user as a duplicate', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ava@example.com',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'ava@example.com',
      passwordHash: 'secret-hash',
    });

    await service.updateMe('user-1', { email: 'AVA@EXAMPLE.COM' });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        firstName: undefined,
        lastName: undefined,
        phone: undefined,
        email: 'ava@example.com',
      },
    });
  });

  it('creates administrator accounts with a hashed password and safe response', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'admin-1',
      firstName: 'Morgan',
      lastName: 'Admin',
      email: 'morgan@example.com',
      role: 'ADMIN',
      passwordHash: 'hashed-admin-password',
    });

    const result = await service.createAdmin({
      firstName: ' Morgan ',
      lastName: ' Admin ',
      email: ' MORGAN@EXAMPLE.COM ',
      password: 'LongAdminPassword123!',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: 'Morgan',
        lastName: 'Admin',
        email: 'morgan@example.com',
        role: 'ADMIN',
      }),
    });
    expect(prisma.user.create.mock.calls[0][0].data.passwordHash).not.toBe(
      'LongAdminPassword123!',
    );
    expect(result).toEqual({
      id: 'admin-1',
      firstName: 'Morgan',
      lastName: 'Admin',
      email: 'morgan@example.com',
      role: 'ADMIN',
    });
  });

  it('rejects duplicate admin emails', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.createAdmin({
        firstName: 'Morgan',
        lastName: 'Admin',
        email: 'morgan@example.com',
        password: 'LongAdminPassword123!',
      }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('removes password hashes from the administrative user list', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'user-1', passwordHash: 'secret-hash', email: 'ava@example.com' },
    ]);

    await expect(service.findAll()).resolves.toEqual([
      { id: 'user-1', email: 'ava@example.com' },
    ]);
  });

  it('propagates database errors from user retrieval', async () => {
    const failure = new Error('database unavailable');
    prisma.user.findMany.mockRejectedValue(failure);

    await expect(service.findAll()).rejects.toBe(failure);
  });
});
