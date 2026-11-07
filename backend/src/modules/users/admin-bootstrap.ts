import { ConflictException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { PrismaClient } from '../../../generated/prisma/client.js';
import type { CreateAdminDto } from './users.service.js';

const ADMIN_BOOTSTRAP_LOCK_ID = 748392615;

/**
 * Create the first administrator atomically; a transaction-scoped advisory
 * lock prevents concurrent bootstrap runs from creating multiple admins.
 */
export async function bootstrapFirstAdmin(
  prisma: Pick<PrismaClient, '$transaction'>,
  dto: CreateAdminDto,
) {
  const email = dto.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(dto.password, 12);

  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(${ADMIN_BOOTSTRAP_LOCK_ID})`;

    const adminCount = await transaction.user.count({
      where: { role: 'ADMIN' },
    });
    if (adminCount > 0) {
      throw new ConflictException(
        'An administrator already exists. Use the authenticated admin endpoint.',
      );
    }

    const existingUser = await transaction.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('An account with that email already exists.');
    }

    return transaction.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });
  });
}
