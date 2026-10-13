import { Module } from '@nestjs/common';
import { ServicesAdminController, ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  controllers: [ServicesController, ServicesAdminController],
  providers: [ServicesService],
})
export class ServicesModule {}
