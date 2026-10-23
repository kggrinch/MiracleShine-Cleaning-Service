import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  ContactMessagesService,
  CreateContactMessageDto,
  UpdateContactMessageStatusDto,
} from './contact-messages.service.js';

@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  /** POST /api/v1/contact-messages — submit a contact message with optional bearer authentication. */
  @Post()
  @UseGuards(OptionalAuthGuard)
  create(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: CreateContactMessageDto,
  ) {
    return this.contactMessagesService.create(dto, req.user?.id);
  }

  /** GET /api/v1/contact-messages/:id — fetch one message; admin bearer token required. */
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.contactMessagesService.findOne(id);
  }
}

@Controller('admin')
export class AdminContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  /** GET /api/v1/admin/contact-messages — list all messages; admin bearer token required. */
  @Get('contact-messages')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  listAll() {
    return this.contactMessagesService.findAll();
  }

  /** PATCH /api/v1/admin/contact-messages/:id/status — update message status; admin bearer token required. */
  @Patch('contact-messages/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactMessageStatusDto,
  ) {
    return this.contactMessagesService.updateStatus(id, dto);
  }
}
