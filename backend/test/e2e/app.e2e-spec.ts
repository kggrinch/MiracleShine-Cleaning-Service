jest.mock('../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { AuthService } from '../../src/modules/auth/auth.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  const usersById = new Map<string, Record<string, unknown>>([
    [
      'admin-1',
      {
        id: 'admin-1',
        firstName: 'Initial',
        lastName: 'Admin',
        email: 'initial@example.com',
        passwordHash: 'not-used',
        role: 'ADMIN',
        isActive: true,
      },
    ],
    [
      'customer-1',
      {
        id: 'customer-1',
        firstName: 'Customer',
        lastName: 'Account',
        email: 'customer@example.com',
        passwordHash: 'not-used',
        role: 'CUSTOMER',
        isActive: true,
      },
    ],
  ]);

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret-that-is-at-least-32-bytes';
    const prismaMock = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      user: {
        findUnique: jest.fn(
          (args: { where: { id?: string; email?: string } }) => {
            if (args.where.id) {
              return Promise.resolve(usersById.get(args.where.id) ?? null);
            }
            return Promise.resolve(
              [...usersById.values()].find(
                (user) => user.email === args.where.email,
              ) ?? null,
            );
          },
        ),
        create: jest.fn((args: { data: Record<string, unknown> }) => {
          const user = {
            id: `created-${usersById.size}`,
            ...args.data,
            isActive: true,
          };
          usersById.set(String(user.id), user);
          return Promise.resolve(user);
        }),
      },
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/api/v1')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/v1/auth/me rejects unauthenticated requests', () => {
    return request(app.getHttpServer() as Server)
      .get('/api/v1/auth/me')
      .expect(401);
  });

  it('creates admin accounts only through an authenticated admin', async () => {
    const requestBody = {
      firstName: 'New',
      lastName: 'Admin',
      email: 'new.admin@example.com',
      password: 'LongAdminPassword123!',
      role: 'CUSTOMER',
    };

    await request(app.getHttpServer() as Server)
      .post('/api/v1/users/admin')
      .send(requestBody)
      .expect(401);

    const customerToken = authService.issueToken('customer-1');
    await request(app.getHttpServer() as Server)
      .post('/api/v1/users/admin')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(requestBody)
      .expect(403);

    const adminToken = authService.issueToken('admin-1');
    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/users/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(requestBody)
      .expect(201);

    const responseBody = response.body as {
      user?: { role: string; email: string };
      role?: string;
      email?: string;
    };
    expect(responseBody.user ?? responseBody).toMatchObject({
      role: 'ADMIN',
      email: 'new.admin@example.com',
    });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  it('rejects duplicate admin emails and invalid admin details', async () => {
    const adminToken = authService.issueToken('admin-1');

    await request(app.getHttpServer() as Server)
      .post('/api/v1/users/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Other',
        lastName: 'Admin',
        email: 'new.admin@example.com',
        password: 'LongAdminPassword123!',
      })
      .expect(409);

    await request(app.getHttpServer() as Server)
      .post('/api/v1/users/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Invalid' })
      .expect(400);
  });

  it('forces public registrations to remain customers even if role is supplied', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Public',
        lastName: 'Registration',
        email: 'public@example.com',
        password: 'Password123!',
        role: 'ADMIN',
      })
      .expect(201);

    const responseBody = response.body as { user: { role: string } };
    expect(responseBody.user.role).toBe('CUSTOMER');
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });
});
