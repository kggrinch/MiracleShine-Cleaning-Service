import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-errors.js';

type ServiceWhere = {
  category?: CreateServiceDto['category'];
  isActive?: boolean;
  OR?: Array<
    | { name: { contains: string; mode: 'insensitive' } }
    | { description: { contains: string; mode: 'insensitive' } }
  >;
};

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @IsEnum(['RESIDENTIAL', 'COMMERCIAL', 'SPECIALTY'])
  category!: 'RESIDENTIAL' | 'COMMERCIAL' | 'SPECIALTY';

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  startingPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    category?: string;
    search?: string;
    isActive?: string;
  }) {
    const where: ServiceWhere = {};

    if (filters?.category) {
      const category = filters.category.trim().toUpperCase();
      if (
        category !== 'RESIDENTIAL' &&
        category !== 'COMMERCIAL' &&
        category !== 'SPECIALTY'
      ) {
        throw new BadRequestException('Invalid service category.');
      }
      where.category = category;
    }

    if (filters?.isActive !== undefined) {
      if (filters.isActive !== 'true' && filters.isActive !== 'false') {
        throw new BadRequestException('isActive must be true or false.');
      }
      where.isActive = filters.isActive === 'true';
    }

    if (filters?.search) {
      const term = filters.search.trim();
      if (term) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ];
      }
    }

    return this.prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, includeInactive = false) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service || (!includeInactive && !service.isActive)) {
      throw new NotFoundException('Service not found.');
    }

    return this.withSlug(service);
  }

  async findBySlug(slug: string) {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const match = services.find(
      (service) => this.slugify(service.name) === slug,
    );
    if (!match) {
      throw new NotFoundException('Service not found.');
    }

    return this.withSlug(match);
  }

  async create(dto: CreateServiceDto) {
    const name = dto.name.trim();
    const existing = await this.prisma.service.findFirst({
      where: { name },
    });

    if (existing) {
      throw new BadRequestException('A service with that name already exists.');
    }

    try {
      return await this.prisma.service.create({
        data: {
          name,
          description: dto.description.trim(),
          category: dto.category,
          startingPrice:
            dto.startingPrice !== undefined ? String(dto.startingPrice) : null,
          estimatedDurationMinutes: dto.estimatedDurationMinutes ?? 60,
          imageUrl: dto.imageUrl ?? null,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException(
          'A service with that name already exists.',
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Service not found.');
    }

    if (dto.name && dto.name.trim() !== existing.name) {
      const duplicate = await this.prisma.service.findFirst({
        where: { name: dto.name.trim() },
      });
      if (duplicate) {
        throw new BadRequestException(
          'A service with that name already exists.',
        );
      }
    }

    try {
      return await this.prisma.service.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          description: dto.description?.trim(),
          category: dto.category,
          startingPrice:
            dto.startingPrice === undefined
              ? undefined
              : String(dto.startingPrice),
          estimatedDurationMinutes: dto.estimatedDurationMinutes,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive,
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new BadRequestException(
          'A service with that name already exists.',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }

    const quoteRequests = await this.prisma.quoteRequest.findMany({
      where: { serviceId: id },
      select: { id: true },
    });

    if (quoteRequests.length > 0) {
      await this.prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        message:
          'Service deactivated instead of deleted because quote history references it.',
        id,
      };
    }

    await this.prisma.service.delete({ where: { id } });
    return { deleted: true, id };
  }

  async resetDefaults() {
    const defaults: Array<{
      name: string;
      description: string;
      category: CreateServiceDto['category'];
      startingPrice: string | null;
      estimatedDurationMinutes: number;
    }> = [
      {
        name: 'Residential Cleaning',
        description: 'Routine cleaning for houses and apartments.',
        category: 'RESIDENTIAL',
        startingPrice: '120.00',
        estimatedDurationMinutes: 120,
      },
      {
        name: 'Commercial Cleaning',
        description: 'Cleaning services for commercial properties.',
        category: 'COMMERCIAL',
        startingPrice: '200.00',
        estimatedDurationMinutes: 180,
      },
      {
        name: 'Deep Cleaning',
        description: 'Detailed cleaning of hard-to-reach areas.',
        category: 'RESIDENTIAL',
        startingPrice: '180.00',
        estimatedDurationMinutes: 240,
      },
      {
        name: 'Move In / Move Out Cleaning',
        description: 'Cleaning for properties before or after a move.',
        category: 'RESIDENTIAL',
        startingPrice: '220.00',
        estimatedDurationMinutes: 240,
      },
      {
        name: 'Disinfecting and Sanitizing',
        description: 'Cleaning focused on frequently touched surfaces.',
        category: 'SPECIALTY',
        startingPrice: '150.00',
        estimatedDurationMinutes: 120,
      },
      {
        name: 'Post Construction Cleaning',
        description: 'Removal of dust and debris after construction.',
        category: 'SPECIALTY',
        startingPrice: '300.00',
        estimatedDurationMinutes: 300,
      },
      {
        name: 'Carpet Cleaning',
        description: 'Cleaning service for carpets and rugs.',
        category: 'SPECIALTY',
        startingPrice: '100.00',
        estimatedDurationMinutes: 90,
      },
      {
        name: 'Office Cleaning',
        description: 'Cleaning for offices and workspaces.',
        category: 'COMMERCIAL',
        startingPrice: '175.00',
        estimatedDurationMinutes: 150,
      },
      {
        name: 'Specialty Cleaning',
        description: 'Custom cleaning for specific customer needs.',
        category: 'SPECIALTY',
        startingPrice: null,
        estimatedDurationMinutes: 120,
      },
    ];

    const results = await Promise.all(
      defaults.map((service) =>
        this.prisma.service.upsert({
          where: { name: service.name },
          update: {
            description: service.description,
            category: service.category,
            startingPrice: service.startingPrice,
            estimatedDurationMinutes: service.estimatedDurationMinutes,
            isActive: true,
          },
          create: {
            name: service.name,
            description: service.description,
            category: service.category,
            startingPrice: service.startingPrice,
            estimatedDurationMinutes: service.estimatedDurationMinutes,
            isActive: true,
          },
        }),
      ),
    );

    return results.map((service) => this.withSlug(service));
  }

  private withSlug<T extends { name: string }>(
    service: T,
  ): T & { slug: string } {
    return {
      ...service,
      slug: this.slugify(service.name),
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
