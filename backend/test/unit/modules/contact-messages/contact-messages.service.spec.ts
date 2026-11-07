jest.mock('../../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service.js';
import { ContactMessagesService } from '../../../../src/modules/contact-messages/contact-messages.service.js';

const createPrismaMock = () => ({
  contactMessage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

describe('ContactMessagesService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ContactMessagesService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module = await Test.createTestingModule({
      providers: [
        ContactMessagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ContactMessagesService);
  });

  it('creates a normalized new contact message', async () => {
    prisma.contactMessage.create.mockResolvedValue({ id: 'message-1' });

    await service.create({
      customerName: ' Ava Smith ',
      email: ' AVA@EXAMPLE.COM ',
      subject: ' Estimate ',
      message: ' Please contact me about cleaning. ',
    });

    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: {
        userId: null,
        customerName: 'Ava Smith',
        email: 'ava@example.com',
        phone: null,
        subject: 'Estimate',
        message: 'Please contact me about cleaning.',
        status: 'NEW',
      },
    });
  });

  it('retrieves a contact message or reports that it is missing', async () => {
    prisma.contactMessage.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('updates status only after confirming the message exists', async () => {
    prisma.contactMessage.findUnique.mockResolvedValue({ id: 'message-1' });
    prisma.contactMessage.update.mockResolvedValue({
      id: 'message-1',
      status: 'READ',
    });

    await expect(
      service.updateStatus('message-1', { status: 'READ' }),
    ).resolves.toMatchObject({ status: 'READ' });
    expect(prisma.contactMessage.update).toHaveBeenCalledWith({
      where: { id: 'message-1' },
      data: { status: 'READ' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  });

  it('propagates database errors from contact submission', async () => {
    const failure = new Error('database unavailable');
    prisma.contactMessage.create.mockRejectedValue(failure);

    await expect(
      service.create({
        customerName: 'Ava Smith',
        email: 'ava@example.com',
        subject: 'Estimate',
        message: 'Please contact me about cleaning.',
      }),
    ).rejects.toBe(failure);
  });
});
