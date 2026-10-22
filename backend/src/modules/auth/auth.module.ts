import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { OptionalAuthGuard } from './optional-auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OptionalAuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, OptionalAuthGuard, RolesGuard],
})
export class AuthModule {}
