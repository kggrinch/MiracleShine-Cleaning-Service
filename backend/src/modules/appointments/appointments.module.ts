import { Module } from '@nestjs/common';
import {
  AdminAppointmentsController,
  AppointmentsController,
} from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';

@Module({
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
