import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { CustomerService } from './customer.service.js';
import { CustomerController } from './customer.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
