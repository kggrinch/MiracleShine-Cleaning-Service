import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ContactMessagesService,
  CreateContactMessageDto,
  UpdateContactMessageStatusDto,
} from './contact-messages.service.js';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactMessagesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactMessagesService.findOne(id);
  }
}

@Controller('admin')
export class AdminContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Get('contact-messages')
  listAll() {
    return this.contactMessagesService.findAll();
  }

  @Patch('contact-messages/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateContactMessageStatusDto) {
    return this.contactMessagesService.updateStatus(id, dto);
  }
}
