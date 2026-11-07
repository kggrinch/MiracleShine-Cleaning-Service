jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { ServicesService } from '../../../../src/modules/services/services.service.js';

const createPrismaMock = () => ({
  service: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  quoteRequest: { findMany: jest.fn() },
});

describe('ServicesService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ServicesService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ServicesService);
  });

  it('filters available services by normalized category and search term', async () => {
    prisma.service.findMany.mockResolvedValue([]);

    await service.findAll({
      category: 'residential',
      search: '  deep clean ',
      isActive: 'true',
    });

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      where: {
        category: 'RESIDENTIAL',
        isActive: true,
        OR: [
          { name: { contains: 'deep clean', mode: 'insensitive' } },
          { description: { contains: 'deep clean', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('rejects invalid category and active-state query values', async () => {
    await expect(service.findAll({ category: 'unrecognized' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.findAll({ isActive: 'yes' })).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.service.findMany).not.toHaveBeenCalled();
  });

  it('returns a matching active service by slug', async () => {
    prisma.service.findMany.mockResolvedValue([
      { id: 'service-1', name: 'Deep Cleaning' },
    ]);

    await expect(service.findBySlug('deep-cleaning')).resolves.toMatchObject({
      id: 'service-1',
      slug: 'deep-cleaning',
    });
  });

  it('throws when a service does not exist', async () => {
    prisma.service.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('creates a normalized service with its default duration', async () => {
    prisma.service.findFirst.mockResolvedValue(null);
    prisma.service.create.mockResolvedValue({ id: 'service-1' });

    await service.create({
      name: '  Deep Cleaning ',
      description: '  Detailed cleaning throughout the property. ',
      category: 'RESIDENTIAL',
    });

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: {
        name: 'Deep Cleaning',
        description: 'Detailed cleaning throughout the property.',
        category: 'RESIDENTIAL',
        startingPrice: null,
        estimatedDurationMinutes: 60,
        imageUrl: null,
        isActive: true,
      },
    });
  });

  it('rejects duplicate service names', async () => {
    prisma.service.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        name: 'Deep Cleaning',
        description: 'Detailed cleaning throughout the property.',
        category: 'RESIDENTIAL',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.service.create).not.toHaveBeenCalled();
  });

  it('rejects updates for missing services', async () => {
    prisma.service.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing', { isActive: false }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deactivates services referenced by quote history', async () => {
    prisma.service.findUnique.mockResolvedValue({ id: 'service-1' });
    prisma.quoteRequest.findMany.mockResolvedValue([{ id: 'quote-1' }]);
    prisma.service.update.mockResolvedValue({});

    await expect(service.remove('service-1')).resolves.toEqual({
      message:
        'Service deactivated instead of deleted because quote history references it.',
      id: 'service-1',
    });
    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: 'service-1' },
      data: { isActive: false },
    });
    expect(prisma.service.delete).not.toHaveBeenCalled();
  });

  it('deletes unreferenced services', async () => {
    prisma.service.findUnique.mockResolvedValue({ id: 'service-1' });
    prisma.quoteRequest.findMany.mockResolvedValue([]);

    await expect(service.remove('service-1')).resolves.toEqual({
      deleted: true,
      id: 'service-1',
    });
    expect(prisma.service.delete).toHaveBeenCalledWith({
      where: { id: 'service-1' },
    });
  });

  it('propagates database failures instead of returning a success-shaped value', async () => {
    const failure = new Error('database unavailable');
    prisma.service.findMany.mockRejectedValue(failure);

    await expect(service.findAll()).rejects.toBe(failure);
  });
});
