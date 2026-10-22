import { Module } from '@nestjs/common';
import {
  AdminAppointmentsController,
  AppointmentsController,
} from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
