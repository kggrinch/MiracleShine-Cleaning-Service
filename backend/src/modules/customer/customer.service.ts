import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        first_name: createCustomerDto.firstName,
        last_name: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone ?? 'N/A',
        passport_number: createCustomerDto.passportNumber ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.customer.findMany();
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { user_id: id } });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { user_id: id } });

    if (!existing) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return this.prisma.customer.update({
      where: { user_id: id },
      data: {
        first_name: updateCustomerDto.firstName,
        last_name: updateCustomerDto.lastName,
        email: updateCustomerDto.email,
        phone: updateCustomerDto.phone,
        passport_number: updateCustomerDto.passportNumber,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.customer.findUnique({ where: { user_id: id } });

    if (!existing) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return this.prisma.customer.delete({ where: { user_id: id } });
  }
}
