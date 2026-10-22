import { Module } from '@nestjs/common';
import {
  AdminContactMessagesController,
  ContactMessagesController,
} from './contact-messages.controller.js';
import { ContactMessagesService } from './contact-messages.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ContactMessagesController, AdminContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
