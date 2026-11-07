import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** GET /api/v1 - public health check. */
  @Get()
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
