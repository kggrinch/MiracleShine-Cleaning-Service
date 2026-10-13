import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard.js';

export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
