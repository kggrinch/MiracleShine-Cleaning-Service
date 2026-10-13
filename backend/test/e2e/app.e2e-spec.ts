jest.mock('../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
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
});
