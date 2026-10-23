import { Module } from '@nestjs/common';
import {
  AdminContactMessagesController,
  ContactMessagesController,
} from './contact-messages.controller.js';
import { ContactMessagesService } from './contact-messages.service.js';
import { AuthModule } from '../auth/auth.module.js';

/** Register public contact submission and admin message-management routes. */
@Module({
  imports: [AuthModule],
  controllers: [ContactMessagesController, AdminContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
