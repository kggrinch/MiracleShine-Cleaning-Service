import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

export async function connectE2eDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be configured for full-stack E2E tests.');
  }

  const databaseHost = new URL(databaseUrl).hostname;
  if (!['localhost', '127.0.0.1', '::1'].includes(databaseHost)) {
    throw new Error('Full-stack E2E tests are restricted to a local database.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  await prisma.$connect();
  return prisma;
}

export async function cleanE2eData(
  prisma: PrismaClient,
  email: string,
  serviceName: string,
) {
  const quotes = await prisma.quoteRequest.findMany({
    where: { customerEmail: email },
    select: { id: true },
  });
  const quoteIds = quotes.map(({ id }) => id);
  const appointments = quoteIds.length
    ? await prisma.appointment.findMany({
        where: { quoteRequestId: { in: quoteIds } },
        select: { id: true },
      })
    : [];
  const appointmentIds = appointments.map(({ id }) => id);

  if (appointmentIds.length) {
    await prisma.review.deleteMany({
      where: { appointmentId: { in: appointmentIds } },
    });
    await prisma.appointment.deleteMany({
      where: { id: { in: appointmentIds } },
    });
  }
  if (quoteIds.length) {
    await prisma.quoteRequest.deleteMany({ where: { id: { in: quoteIds } } });
  }

  await prisma.contactMessage.deleteMany({ where: { email } });
  await prisma.service.deleteMany({ where: { name: serviceName } });
  await prisma.user.deleteMany({ where: { email } });
}
