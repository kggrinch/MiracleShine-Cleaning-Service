import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CustomerModule } from './modules/customer/customer.module.js';

@Module({
  imports: [CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
