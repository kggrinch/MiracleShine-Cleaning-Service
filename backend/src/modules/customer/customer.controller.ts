import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

@Controller('customer')
export class CustomerController {
  /**
   * Routes (base path: /customer)
   */
  constructor(private readonly customerService: CustomerService) {}

  //  * - POST /customer
  //  *   - Description: create a new customer
  //  *   - Body: { first_name: string, last_name: string, email: string, phone?: string, passport_number?: string }
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  //  * - GET /customer
  //  *   - Description: return all customers
  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  //  * - GET /customer/:id
  //  *   - Description: return a single customer by `user_id` (numeric id)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

//  * - PATCH /customer/:id
//  *   - Description: update a customer by `user_id`
//  *   - Body: partial fields to update (same shape as CreateCustomerDto)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }


//  * - DELETE /customer/:id
//  *   - Description: delete a customer by `user_id`
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
