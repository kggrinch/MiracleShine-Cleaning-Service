import { Module } from '@nestjs/common';
import {
  AdminContactMessagesController,
  ContactMessagesController,
} from './contact-messages.controller.js';
import { ContactMessagesService } from './contact-messages.service.js';

@Module({
  controllers: [ContactMessagesController, AdminContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}
