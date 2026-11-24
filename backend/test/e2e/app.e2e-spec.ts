jest.mock('../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import bcrypt from 'bcrypt';
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
  const serviceId = '550e8400-e29b-41d4-a716-446655440000';
  const quoteRecords: Record<string, unknown>[] = [];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e-test-jwt-secret-that-is-at-least-32-bytes';
    const initialPasswords = new Map([
      ['admin-1', 'AdminCurrentPassword123'],
      ['customer-1', 'CustomerCurrentPassword123'],
    ]);
    for (const [id, user] of usersById) {
      user.passwordHash = await bcrypt.hash(initialPasswords.get(id)!, 4);
    }

    const prismaMock = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      service: {
        findUnique: jest.fn(({ where }: { where: { id: string } }) =>
          Promise.resolve(
            where.id === serviceId
              ? { id: serviceId, name: 'Residential Cleaning', isActive: true }
              : null,
          ),
        ),
      },
      quoteRequest: {
        create: jest.fn(({ data }: { data: Record<string, unknown> }) => {
          const quote = {
            id: `quote-${quoteRecords.length + 1}`,
            ...data,
            status: 'PENDING',
            createdAt: new Date('2026-01-01T12:00:00.000Z'),
            updatedAt: new Date('2026-01-01T12:00:00.000Z'),
            service: {
              id: serviceId,
              name: 'Residential Cleaning',
              isActive: true,
            },
          };
          quoteRecords.push(quote);
          return Promise.resolve(quote);
        }),
      },
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
        update: jest.fn(
          (args: { where: { id: string }; data: Record<string, unknown> }) => {
            const existing = usersById.get(args.where.id);
            if (!existing) return Promise.resolve(null);
            const user = { ...existing, ...args.data, updatedAt: new Date() };
            usersById.set(args.where.id, user);
            return Promise.resolve(user);
          },
        ),
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

  it('creates guest and authenticated quotes with only verified account ownership', async () => {
    const requestBody = {
      userId: 'admin-1',
      serviceId,
      customerFirstName: ' Ava ',
      customerLastName: ' Smith ',
      customerEmail: ' AVA@EXAMPLE.COM ',
      customerPhone: '',
      propertyType: 'HOUSE',
      squareFootage: 1200,
      bedrooms: 3,
      bathrooms: '1.5',
      streetAddress: ' 1 Main Street ',
      city: ' Seattle ',
      state: ' WA ',
      postalCode: ' 98101 ',
      preferredDate: '2026-08-15',
      preferredTime: '09:30',
      notes: '  Focus on the kitchen.  ',
      status: 'SENT',
    };

    const guestResponse = await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send(requestBody)
      .expect(201);
    expect(guestResponse.body).toMatchObject({
      userId: null,
      serviceId,
      customerFirstName: 'Ava',
      customerEmail: 'ava@example.com',
      squareFootage: 1200,
      bedrooms: 3,
      bathrooms: '1.5',
      streetAddress: '1 Main Street',
      preferredDate: '2026-08-15T00:00:00.000Z',
      preferredTime: '1970-01-01T09:30:00.000Z',
      notes: 'Focus on the kitchen.',
      status: 'PENDING',
    });

    const customerToken = authService.issueToken('customer-1');
    const customerResponse = await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(requestBody)
      .expect(201);
    const customerQuote = customerResponse.body as {
      userId: string | null;
      status: string;
    };
    expect(customerQuote.userId).toBe('customer-1');
    expect(customerQuote.status).toBe('PENDING');

    expect(quoteRecords).toHaveLength(2);
    expect(quoteRecords[0].userId).toBeNull();
    expect(quoteRecords[1].userId).toBe('customer-1');
    expect(quoteRecords[1]).not.toHaveProperty('status', 'SENT');
  });

  it('rejects invalid quote fields and unavailable services', async () => {
    const body = {
      serviceId,
      customerFirstName: 'Ava',
      customerLastName: 'Smith',
      customerEmail: 'ava@example.com',
      propertyType: 'HOUSE',
      streetAddress: '1 Main Street',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
    };

    await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send({ ...body, customerEmail: 'invalid' })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send({ ...body, city: undefined })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send({ ...body, propertyType: 'WAREHOUSE' })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send({ ...body, bathrooms: 50.1 })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/quote-requests')
      .send({ ...body, serviceId: '550e8400-e29b-41d4-a716-446655440001' })
      .expect(400);
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

  it('changes customer and administrator passwords only for the authenticated account', async () => {
    const customerToken = authService.issueToken('customer-1');
    const customerResponse = await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        userId: 'admin-1',
        currentPassword: 'CustomerCurrentPassword123',
        newPassword: 'CustomerNewPassword123',
        confirmNewPassword: 'CustomerNewPassword123',
      })
      .expect(200);

    expect(customerResponse.body).toEqual({
      message: 'Password changed successfully.',
    });
    expect(JSON.stringify(customerResponse.body)).not.toMatch(
      /passwordHash|CustomerNewPassword123/,
    );
    await request(app.getHttpServer() as Server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'CustomerNewPassword123',
      })
      .expect(201);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/auth/login')
      .send({
        email: 'initial@example.com',
        password: 'AdminCurrentPassword123',
      })
      .expect(201);

    const adminToken = authService.issueToken('admin-1');
    await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        currentPassword: 'AdminCurrentPassword123',
        newPassword: 'AdminNewPassword123',
        confirmNewPassword: 'AdminNewPassword123',
      })
      .expect(200);
    await request(app.getHttpServer() as Server)
      .post('/api/v1/auth/login')
      .send({
        email: 'initial@example.com',
        password: 'AdminNewPassword123',
      })
      .expect(201);
  });

  it('rejects unauthenticated, incomplete, weak, or incorrect-current-password changes', async () => {
    const endpoint = request(app.getHttpServer() as Server).patch(
      '/api/v1/users/me/password',
    );
    await endpoint
      .send({
        currentPassword: 'CustomerNewPassword123',
        newPassword: 'AnotherNewPassword123',
        confirmNewPassword: 'AnotherNewPassword123',
      })
      .expect(401);

    const customerToken = authService.issueToken('customer-1');
    await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({})
      .expect(400);
    await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        currentPassword: 'CustomerNewPassword123',
        newPassword: 'short',
        confirmNewPassword: 'short',
      })
      .expect(400);
    await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        currentPassword: 'IncorrectCurrentPassword',
        newPassword: 'AnotherNewPassword123',
        confirmNewPassword: 'AnotherNewPassword123',
      })
      .expect(400);

    await request(app.getHttpServer() as Server)
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'CustomerNewPassword123',
      })
      .expect(201);

    const adminToken = authService.issueToken('admin-1');
    await request(app.getHttpServer() as Server)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        currentPassword: 'AdminNewPassword123',
        newPassword: 'NewPass1',
        confirmNewPassword: 'NewPass1',
      })
      .expect(400);
  });
});
