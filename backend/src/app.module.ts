import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { QuoteRequestsModule } from './modules/quote-requests/quote-requests.module.js';
import { AppointmentsModule } from './modules/appointments/appointments.module.js';
import { ContactMessagesModule } from './modules/contact-messages/contact-messages.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    QuoteRequestsModule,
    AppointmentsModule,
    ContactMessagesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
