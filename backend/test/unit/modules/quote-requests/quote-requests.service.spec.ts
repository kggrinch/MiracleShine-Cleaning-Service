jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { QuoteRequestsService } from '../../../../src/modules/quote-requests/quote-requests.service.js';

const createPrismaMock = () => ({
  service: { findUnique: jest.fn(), findFirst: jest.fn() },
  quoteRequest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
});

describe('QuoteRequestsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: QuoteRequestsService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [
        QuoteRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(QuoteRequestsService);
  });

  const quoteDto = {
    serviceId: 'service-1',
    customerFirstName: ' Ava ',
    customerLastName: ' Smith ',
    customerEmail: ' AVA@EXAMPLE.COM ',
    propertyType: 'HOUSE' as const,
    streetAddress: '  1 Main St ',
    city: ' Seattle ',
    state: ' WA ',
    postalCode: ' 98101 ',
    preferredDate: '2026-12-01',
    preferredTime: '09:30',
  };

  it('creates a pending quote with normalized values and the selected active service', async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: 'service-1',
      isActive: true,
    });
    prisma.quoteRequest.create.mockResolvedValue({ id: 'quote-1' });

    await service.create(quoteDto, 'user-1');

    expect(prisma.quoteRequest.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        serviceId: 'service-1',
        customerFirstName: 'Ava',
        customerLastName: 'Smith',
        customerEmail: 'ava@example.com',
        customerPhone: null,
        propertyType: 'HOUSE',
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        streetAddress: '1 Main St',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        preferredDate: new Date('2026-12-01'),
        preferredTime: new Date('1970-01-01T09:30:00.000Z'),
        notes: null,
        status: 'PENDING',
      },
      include: { service: true },
    });
  });

  it('rejects missing or inactive services', async () => {
    prisma.service.findUnique.mockResolvedValue({
      id: 'service-1',
      isActive: false,
    });

    await expect(service.create(quoteDto)).rejects.toThrow(BadRequestException);
    expect(prisma.quoteRequest.create).not.toHaveBeenCalled();
  });

  it('rejects a quote without a service reference', async () => {
    await expect(
      service.create({ ...quoteDto, serviceId: undefined }),
    ).rejects.toThrow(BadRequestException);
  });

  it('limits customer quote history to the authenticated user', async () => {
    prisma.quoteRequest.findMany.mockResolvedValue([]);

    await service.findCustomerQuotes('user-1');

    expect(prisma.quoteRequest.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });
  });

  it('rejects access to another customer quote', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'owner-1',
    });

    await expect(service.findOne('quote-1', 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns an admin quote without customer ownership filtering', async () => {
    const quote = { id: 'quote-1', userId: 'owner-1' };
    prisma.quoteRequest.findUnique.mockResolvedValue(quote);

    await expect(service.findOne('quote-1', undefined, true)).resolves.toBe(
      quote,
    );
  });

  it('declines a customer quote when cancelling it', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'user-1',
      status: 'PENDING',
    });
    prisma.quoteRequest.updateMany.mockResolvedValue({ count: 1 });
    prisma.quoteRequest.findUnique
      .mockResolvedValueOnce({
        id: 'quote-1',
        userId: 'user-1',
        status: 'PENDING',
      })
      .mockResolvedValueOnce({
        id: 'quote-1',
        status: 'DECLINED',
      });

    await service.cancel('quote-1', 'user-1');

    expect(prisma.quoteRequest.updateMany).toHaveBeenCalledWith({
      where: { id: 'quote-1', status: 'PENDING' },
      data: { status: 'DECLINED' },
    });
  });

  it('rejects a disallowed administrator quote status transition', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      status: 'COMPLETED',
    });

    await expect(
      service.updateStatus('quote-1', { status: 'PENDING' }, undefined, true),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.quoteRequest.update).not.toHaveBeenCalled();
  });

  it('does not allow customers to update statuses other than declining', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'user-1',
      status: 'PENDING',
    });

    await expect(
      service.updateStatus('quote-1', { status: 'CONTACTED' }, 'user-1'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws when an operation references a missing quote', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
