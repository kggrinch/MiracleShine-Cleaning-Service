import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './roles.guard.js';

/** Attach the roles that RolesGuard must require for a route or controller. */
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
