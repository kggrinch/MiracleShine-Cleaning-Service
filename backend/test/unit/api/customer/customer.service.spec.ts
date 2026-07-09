jest.mock('../../../../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../../../../src/modules/customer/customer.service';
import { PrismaService } from '../../../../src/prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: {
    customer: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      customer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('creates a customer', async () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };

    prisma.customer.create.mockResolvedValue({ user_id: 1, ...payload });

    await expect(service.create(payload as any)).resolves.toEqual({
      user_id: 1,
      ...payload,
    });
    expect(prisma.customer.create).toHaveBeenCalledWith({
      data: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: 'N/A',
        passport_number: null,
      },
    });
  });

  it('returns all customers', async () => {
    prisma.customer.findMany.mockResolvedValue([{ user_id: 1 }]);

    await expect(service.findAll()).resolves.toEqual([{ user_id: 1 }]);
    expect(prisma.customer.findMany).toHaveBeenCalled();
  });
});
