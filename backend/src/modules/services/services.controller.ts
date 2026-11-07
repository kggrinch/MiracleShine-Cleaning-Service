import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { RequireRoles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  CreateServiceDto,
  ServicesService,
  UpdateServiceDto,
} from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /** GET /api/v1/services?category=&search= — list active public services with optional filters. */
  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.servicesService.findAll({ category, search, isActive: 'true' });
  }

  /** GET /api/v1/services/slug/:slug — find an active service by its generated slug. */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  /** GET /api/v1/services/:id — fetch one active service by ID. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /** POST /api/v1/services — create a catalog service; admin bearer token required. */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  /** PATCH /api/v1/services/:id — update a catalog service; admin bearer token required. */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  /** DELETE /api/v1/services/:id — remove or deactivate a service; admin bearer token required. */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}

@Controller('admin')
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesService) {}

  /** GET /api/v1/admin/services?category= — list services, including inactive entries; admin only. */
  @Get('services')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  getAllAdmin(@Query('category') category?: string) {
    return this.servicesService.findAll({ category });
  }

  /** POST /api/v1/admin/services/reset-defaults — upsert the default catalog; admin only. */
  @Post('services/reset-defaults')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  resetDefaults() {
    return this.servicesService.resetDefaults();
  }
}
