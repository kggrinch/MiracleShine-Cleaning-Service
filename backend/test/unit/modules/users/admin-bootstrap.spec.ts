jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException } from '@nestjs/common';
import type { PrismaClient } from '../../../../generated/prisma/client.js';
import { bootstrapFirstAdmin } from '../../../../src/modules/users/admin-bootstrap.js';

describe('bootstrapFirstAdmin', () => {
  const dto = {
    firstName: 'Morgan',
    lastName: 'Admin',
    email: 'MORGAN@example.com',
    password: 'LongAdminPassword123!',
  };

  function createSerializedDatabase() {
    let adminCount = 0;
    let transactionQueue = Promise.resolve();
    const calls: string[] = [];
    const transaction = {
      $queryRaw: (strings: TemplateStringsArray, ...values: number[]) => {
        void strings;
        void values;
        calls.push('lock');
        return Promise.resolve([]);
      },
      user: {
        count: () => {
          calls.push('count');
          return Promise.resolve(adminCount);
        },
        findUnique: () => Promise.resolve(null),
        create: (args: {
          data: {
            firstName: string;
            lastName: string;
            email: string;
            passwordHash: string;
            role: 'ADMIN';
          };
        }) => {
          calls.push('create');
          adminCount += 1;
          return Promise.resolve({ id: 'admin-1', ...args.data });
        },
      },
    };
    const database = {
      $transaction: async <T>(
        callback: (tx: typeof transaction) => Promise<T>,
      ): Promise<T> => {
        const previousTransaction = transactionQueue;
        let releaseTransaction!: () => void;
        transactionQueue = new Promise<void>((resolve) => {
          releaseTransaction = resolve;
        });
        await previousTransaction;
        try {
          return await callback(transaction);
        } finally {
          releaseTransaction();
        }
      },
    } as unknown as Pick<PrismaClient, '$transaction'>;

    return { database, calls };
  }

  it('creates only the first admin and rejects repeated bootstrap attempts', async () => {
    const { database, calls } = createSerializedDatabase();

    const result = await bootstrapFirstAdmin(database, dto);

    expect(result).toMatchObject({
      role: 'ADMIN',
      email: 'morgan@example.com',
    });
    expect(result.passwordHash).not.toBe(dto.password);
    expect(calls.slice(0, 3)).toEqual(['lock', 'count', 'create']);
    await expect(bootstrapFirstAdmin(database, dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('serializes concurrent bootstraps so only one account can be created', async () => {
    const { database, calls } = createSerializedDatabase();

    const results = await Promise.allSettled([
      bootstrapFirstAdmin(database, dto),
      bootstrapFirstAdmin(database, { ...dto, email: 'second@example.com' }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    expect(calls.filter((call) => call === 'create')).toHaveLength(1);
  });
});
