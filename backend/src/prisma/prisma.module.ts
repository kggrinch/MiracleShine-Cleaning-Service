import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
/** Make the shared Prisma connection available to all feature modules. */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}