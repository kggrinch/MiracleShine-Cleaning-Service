jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { ReviewsService } from '../../../../src/modules/reviews/reviews.service.js';

const createPrismaMock = () => ({
  appointment: { findUnique: jest.fn() },
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

  it('creates a pending review for an existing appointment', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'COMPLETED',
      quoteRequest: { userId: 'user-1' },
    });
    prisma.review.findUnique.mockResolvedValue(null);
    prisma.review.create.mockResolvedValue({ id: 'review-1' });

    await service.create(
      {
        appointmentId: 'appointment-1',
        rating: 5,
        comment: '  Excellent service. ',
      },
      'user-1',
    );

    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          appointmentId: 'appointment-1',
          rating: 5,
          comment: 'Excellent service.',
          status: 'PENDING',
        },
      }),
    );
  });

  it('rejects reviews for missing appointments and duplicate appointment reviews', async () => {
    prisma.appointment.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ appointmentId: 'missing', rating: 5 }, 'user-1'),
    ).rejects.toThrow(NotFoundException);

    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'COMPLETED',
      quoteRequest: { userId: 'user-1' },
    });
    prisma.review.findUnique.mockResolvedValue({ id: 'existing-review' });
    await expect(
      service.create({ appointmentId: 'appointment-1', rating: 5 }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects reviews from a different customer and for incomplete appointments', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'COMPLETED',
      quoteRequest: { userId: 'owner-1' },
    });
    await expect(
      service.create({ appointmentId: 'appointment-1', rating: 5 }, 'user-2'),
    ).rejects.toThrow(NotFoundException);

    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'CONFIRMED',
      quoteRequest: { userId: 'user-1' },
    });
    await expect(
      service.create({ appointmentId: 'appointment-1', rating: 5 }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('reports missing reviews before status updates', async () => {
    prisma.review.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing', { status: 'APPROVED' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.review.update).not.toHaveBeenCalled();
  });
});
