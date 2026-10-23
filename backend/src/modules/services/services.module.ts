import { Module } from '@nestjs/common';
import {
  ServicesAdminController,
  ServicesController,
} from './services.controller.js';
import { ServicesService } from './services.service.js';
import { AuthModule } from '../auth/auth.module.js';

/** Register public catalog and admin catalog controllers. */
@Module({
  imports: [AuthModule],
  controllers: [ServicesController, ServicesAdminController],
  providers: [ServicesService],
})
export class ServicesModule {}
