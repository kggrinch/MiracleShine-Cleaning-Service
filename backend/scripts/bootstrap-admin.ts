import 'dotenv/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { CreateAdminDto } from '../src/modules/users/users.service.js';
import { bootstrapFirstAdmin } from '../src/modules/users/admin-bootstrap.js';

/** Validate the environment-provided first-admin details and create the account. */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const firstName = process.env.ADMIN_FIRST_NAME;
  const lastName = process.env.ADMIN_LAST_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!databaseUrl || !firstName || !lastName || !email || !password) {
    throw new Error(
      'DATABASE_URL and all ADMIN_* bootstrap values are required.',
    );
  }

  const dto = plainToInstance(CreateAdminDto, {
    firstName,
    lastName,
    email,
    password,
  });
  const validationErrors = await validate(dto);
  if (validationErrors.length > 0) {
    throw new Error(
      'Administrator details do not satisfy the account requirements.',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  try {
    await bootstrapFirstAdmin(prisma, dto);
    console.log('Initial administrator created.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Administrator bootstrap failed: ${detail}`);
  process.exitCode = 1;
});
