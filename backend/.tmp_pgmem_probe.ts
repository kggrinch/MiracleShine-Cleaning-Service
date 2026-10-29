import fs from 'node:fs';
import path from 'node:path';
import { newDb } from 'pg-mem';
import * as pgMod from 'pg';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const db = newDb();
const pg = db.adapters.createPg();
(pgMod as any).Pool = pg.Pool;
(pgMod as any).Client = pg.Client;

const pool = new pg.Pool();
const sql = fs.readFileSync(path.join(process.cwd(), 'prisma/migrations/20261013060419_init/migration.sql'), 'utf8');

(async () => {
  try {
    await pool.query(sql);
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: 'postgres://localhost:5432/test' }) });
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log('count', count);
    await prisma.$disconnect();
  } finally {
    await pool.end();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
