jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { AppointmentsService } from '../../../../src/modules/appointments/appointments.service.js';

const createPrismaMock = () => ({
  appointment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  quoteRequest: { findUnique: jest.fn() },
});

describe('AppointmentsService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: AppointmentsService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AppointmentsService);
  });

  const appointmentDto = {
    quoteRequestId: 'quote-1',
    scheduledDate: '2026-12-01',
    startTime: '09:30',
    endTime: '11:30',
  };

  it('lists appointments through the customer-owned quote relation', async () => {
    prisma.appointment.findMany.mockResolvedValue([]);

    await service.findCustomerAppointments('user-1');

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { quoteRequest: { userId: 'user-1' } },
        orderBy: { scheduledDate: 'asc' },
      }),
    );
  });

  it('creates an appointment for the owning customer', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'user-1',
    });
    prisma.appointment.findUnique.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue({ id: 'appointment-1' });

    await service.create(appointmentDto, 'user-1');

    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: {
        quoteRequestId: 'quote-1',
        scheduledDate: new Date('2026-12-01'),
        startTime: new Date('1970-01-01T09:30:00.000Z'),
        endTime: new Date('1970-01-01T11:30:00.000Z'),
        notes: null,
        status: 'REQUESTED',
      },
      include: { quoteRequest: { include: { service: true } } },
    });
  });

  it('rejects missing quotes and appointments requested by a different customer', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue(null);
    await expect(service.create(appointmentDto, 'user-1')).rejects.toThrow(
      NotFoundException,
    );

    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'owner-1',
    });
    await expect(service.create(appointmentDto, 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects duplicate appointments for a quote', async () => {
    prisma.quoteRequest.findUnique.mockResolvedValue({
      id: 'quote-1',
      userId: 'user-1',
    });
    prisma.appointment.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(service.create(appointmentDto, 'user-1')).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.appointment.create).not.toHaveBeenCalled();
  });

  it('rejects appointments with invalid dates or a non-increasing time range', async () => {
    await expect(
      service.create(
        { ...appointmentDto, scheduledDate: '2026-02-30' },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create(
        { ...appointmentDto, startTime: '12:00', endTime: '11:00' },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.quoteRequest.findUnique).not.toHaveBeenCalled();
  });

  it('rejects access to another customer appointment', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      quoteRequest: { userId: 'owner-1' },
    });

    await expect(service.findById('appointment-1', 'user-2')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cancels an appointment owned by the customer', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'REQUESTED',
      quoteRequest: { userId: 'user-1' },
    });
    prisma.appointment.updateMany.mockResolvedValue({ count: 1 });
    prisma.appointment.findUnique
      .mockResolvedValueOnce({
        id: 'appointment-1',
        status: 'REQUESTED',
        quoteRequest: { userId: 'user-1' },
      })
      .mockResolvedValueOnce({ status: 'CANCELLED' });

    await service.cancel('appointment-1', 'user-1');

    expect(prisma.appointment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'appointment-1', status: 'REQUESTED' },
        data: { status: 'CANCELLED' },
      }),
    );
  });

  it('enforces administrator access and valid status transitions', async () => {
    prisma.appointment.findUnique.mockResolvedValue({
      id: 'appointment-1',
      status: 'REQUESTED',
    });

    await expect(
      service.updateStatus('appointment-1', { status: 'CONFIRMED' }),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      service.updateStatus('appointment-1', { status: 'COMPLETED' }, true),
    ).rejects.toThrow(BadRequestException);
  });
});
