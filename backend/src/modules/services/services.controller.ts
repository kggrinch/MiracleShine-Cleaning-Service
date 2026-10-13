import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateServiceDto, ServicesService, UpdateServiceDto } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.servicesService.findAll({ category, search, isActive });
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
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}

@Controller('admin')
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('services')
  getAllAdmin(@Query('category') category?: string) {
    return this.servicesService.findAll({ category });
  }

  @Post('services/reset-defaults')
  resetDefaults() {
    return this.servicesService.resetDefaults();
  }
}
