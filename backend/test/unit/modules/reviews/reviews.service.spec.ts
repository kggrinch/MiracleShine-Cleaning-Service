jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { ReviewsService } from '../../../../src/modules/reviews/reviews.service.js';

const createPrismaMock = () => ({
  user: { findUnique: jest.fn() },
  review: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
});

describe('ReviewsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ReviewsService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(ReviewsService);
  });

  it('returns approved reviews only on the public listing', async () => {
    prisma.review.findMany.mockResolvedValue([]);
    await service.findPublicReviews();
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('creates independent pending reviews for the authenticated customer', async () => {
    prisma.user.findUnique.mockResolvedValue({
      firstName: 'Ava',
      lastName: 'Smith',
    });
    prisma.review.create.mockResolvedValue({ id: 'review-1' });

    await service.create(
      { rating: 5, comment: '  Excellent service. ' },
      'user-1',
    );
    await service.create({ rating: 4 }, 'user-1');

    expect(prisma.review.create).toHaveBeenCalledTimes(2);
    expect(prisma.review.create).toHaveBeenNthCalledWith(1, {
      data: {
        userId: 'user-1',
        customerName: 'Ava Smith',
        rating: 5,
        comment: 'Excellent service.',
        status: 'PENDING',
      },
    });
  });

  it('returns only the authenticated customer review history', async () => {
    prisma.review.findMany.mockResolvedValue([]);
    await service.findMine('user-1');
    expect(prisma.review.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('rejects review creation when the authenticated user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.create({ rating: 5 }, 'missing-user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('reports missing reviews before status updates', async () => {
    prisma.review.findUnique.mockResolvedValue(null);
    await expect(
      service.updateStatus('missing', { status: 'APPROVED' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it('updates review moderation status', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'review-1' });
    prisma.review.update.mockResolvedValue({
      id: 'review-1',
      status: 'APPROVED',
    });

    await service.updateStatus('review-1', { status: 'APPROVED' });

    expect(prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'review-1' },
        data: { status: 'APPROVED' },
      }),
    );
  });
});
