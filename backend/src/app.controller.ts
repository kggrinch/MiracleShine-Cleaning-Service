import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  /**
   * Routes (base path: /)
   * - GET /
   *   - Description: health check / root greeting
   *   - Example: GET http://localhost:3000/
   */
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
