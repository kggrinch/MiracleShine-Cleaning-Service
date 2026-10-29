const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const request = require('supertest');
const { newDb, DataType } = require('pg-mem');
const { randomUUID } = require('node:crypto');

process.env.JWT_SECRET = 'this-is-a-valid-jwt-secret-for-integration-tests-1234';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/miracle_shine_test';

const db = newDb();
db.public.registerFunction({
  name: 'gen_random_uuid',
  args: [],
  returns: DataType.uuid,
  implementation: () => randomUUID(),
});
const pg = db.adapters.createPg();
const pgModule = require('pg');
pgModule.Pool = pg.Pool;
pgModule.Client = pg.Client;

const setupSql = `
  CREATE TABLE users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id)
  );

  CREATE UNIQUE INDEX users_email_key ON users (email);

  CREATE TABLE services (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    starting_price NUMERIC(10, 2),
    estimated_duration_minutes INTEGER NOT NULL,
    image_url VARCHAR(2048),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT services_pkey PRIMARY KEY (id)
  );

  CREATE UNIQUE INDEX services_name_key ON services (name);
`;

describe('backend real integration flows', () => {
  let app;
  let prisma;
  let backup;

  beforeAll(async () => {
    const pool = new pg.Pool();
    await pool.query(setupSql);
    backup = db.backup();
    await pool.end();

    const { AppModule } = require('../../../src/app.module.js');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(require('../../../src/prisma/prisma.service.js').PrismaService);
  });

  beforeEach(() => {
    backup.restore();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('registers a customer, logs in, promotes to admin, creates a service, and updates the service record', async () => {
    const email = `customer-${Date.now()}@example.com`;

    const registration = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Customer',
        email,
        password: 'Password123!',
        phone: '425-555-0144',
      })
      .expect(201);

    expect(registration.body.user.email).toBe(email);
    expect(registration.body.user.role).toBe('CUSTOMER');

    const persistedUser = await prisma.user.findUnique({ where: { email } });
    expect(persistedUser).toBeTruthy();
    expect(persistedUser.email).toBe(email);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(201);

    expect(login.body.user.email).toBe(email);
    expect(login.body.token).toBeTruthy();

    await prisma.user.update({
      where: { id: persistedUser.id },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(201);

    const adminToken = adminLogin.body.token;
    const servicePayload = {
      name: `Test Service ${Date.now()}`,
      description: 'A real service created through the backend API.',
      category: 'RESIDENTIAL',
      startingPrice: 135.5,
      estimatedDurationMinutes: 120,
      imageUrl: 'https://example.com/test-service.jpg',
      isActive: true,
    };

    const createService = await request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(servicePayload)
      .expect(201);

    expect(createService.body.name).toBe(servicePayload.name);

    const createdService = await prisma.service.findUnique({
      where: { id: createService.body.id },
    });
    expect(createdService).toBeTruthy();
    expect(createdService.name).toBe(servicePayload.name);
    expect(createdService.startingPrice.toString()).toBe('135.50');

    const updatedName = `${servicePayload.name} Updated`;
    const updateService = await request(app.getHttpServer())
      .patch(`/api/v1/services/${createdService.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: updatedName,
        startingPrice: 145,
      })
      .expect(200);

    expect(updateService.body.name).toBe(updatedName);

    const publicFetch = await request(app.getHttpServer())
      .get(`/api/v1/services/${createdService.id}`)
      .expect(200);

    expect(publicFetch.body.name).toBe(updatedName);
    expect(publicFetch.body.startingPrice).toBe('145');

    const dbUpdatedService = await prisma.service.findUnique({
      where: { id: createdService.id },
    });
    expect(dbUpdatedService.name).toBe(updatedName);
    expect(dbUpdatedService.startingPrice.toString()).toBe('145');
  });

  it('blocks a customer from using the admin-only create-service endpoint', async () => {
    const customerEmail = `customer-block-${Date.now()}@example.com`;

    const registration = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Blocked',
        lastName: 'Customer',
        email: customerEmail,
        password: 'Password123!',
      })
      .expect(201);

    const customerToken = registration.body.token;

    const forbidden = await request(app.getHttpServer())
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: `Forbidden Service ${Date.now()}`,
        description: 'The customer should not be allowed to create catalog entries.',
        category: 'SPECIALTY',
        estimatedDurationMinutes: 90,
      })
      .expect(403);

    expect(forbidden.body.message).toMatch(/permission|Forbidden resource/i);
  });
});
