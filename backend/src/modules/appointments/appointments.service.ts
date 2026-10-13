import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';

export class CreateAppointmentDto {
  @IsString()
  quoteRequestId!: string;

  @IsString()
  scheduledDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  status!: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCustomerAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        quoteRequest: { userId },
      },
      orderBy: { scheduledDate: 'asc' },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  async findById(id: string, userId?: string, admin = false) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { quoteRequest: { include: { service: true, user: true } } },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin && userId && appointment.quoteRequest.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this appointment.');
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto, userId?: string) {
    const quoteRequest = await this.prisma.quoteRequest.findUnique({
      where: { id: dto.quoteRequestId },
      include: { service: true },
    });

    if (!quoteRequest) {
      throw new NotFoundException('Quote request not found.');
    }

    if (userId && quoteRequest.userId !== userId) {
      throw new UnauthorizedException('You do not have access to that quote request.');
    }

    const existing = await this.prisma.appointment.findUnique({
      where: { quoteRequestId: dto.quoteRequestId },
    });

    if (existing) {
      throw new BadRequestException('A booking already exists for this quote request.');
    }

    return this.prisma.appointment.create({
      data: {
        quoteRequestId: dto.quoteRequestId,
        scheduledDate: new Date(dto.scheduledDate),
        startTime: new Date(`1970-01-01T${dto.startTime}:00.000Z`),
        endTime: new Date(`1970-01-01T${dto.endTime}:00.000Z`),
        notes: dto.notes?.trim() || null,
        status: 'REQUESTED',
      },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  async cancel(id: string, userId?: string, admin = false) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { quoteRequest: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin && userId && appointment.quoteRequest.userId !== userId) {
      throw new UnauthorizedException('You do not have access to this appointment.');
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      throw new BadRequestException('This appointment cannot be cancelled in its current status.');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto, admin = false) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin) {
      throw new UnauthorizedException('Only administrators can update appointment status.');
    }

    const allowed: Record<string, string[]> = {
      REQUESTED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      CANCELLED: [],
      COMPLETED: [],
    };

    if (!allowed[appointment.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Status transition from ${appointment.status} to ${dto.status} is not allowed.`,
      );
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  async findAllAdmin() {
    return this.prisma.appointment.findMany({
      orderBy: { scheduledDate: 'asc' },
      include: { quoteRequest: { include: { service: true, user: true } } },
    });
  }
}
