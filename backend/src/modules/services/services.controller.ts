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

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.servicesService.findAll({ category, search, isActive: 'true' });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

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

  @Get('services')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  getAllAdmin(@Query('category') category?: string) {
    return this.servicesService.findAll({ category });
  }

  @Post('services/reset-defaults')
  @UseGuards(AuthGuard, RolesGuard)
  @RequireRoles('ADMIN')
  resetDefaults() {
    return this.servicesService.resetDefaults();
  }
}
