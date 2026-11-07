import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** Return a lightweight status response without probing external dependencies. */
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
