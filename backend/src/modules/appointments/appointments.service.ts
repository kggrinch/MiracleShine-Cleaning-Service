import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service.js';
import { isPrismaUniqueConstraintError } from '../../prisma/prisma-errors.js';

/** Appointment booking details, including strict date and 24-hour time inputs. */
export class CreateAppointmentDto {
  @IsUUID()
  quoteRequestId!: string;

  @IsDateString({ strict: true })
  scheduledDate!: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  status!: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}

@Injectable()
/** Enforce quote ownership, unique bookings, and appointment state transitions. */
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List appointments attached to a customer's quotes in date order. */
  async findCustomerAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: {
        quoteRequest: { userId },
      },
      orderBy: { scheduledDate: 'asc' },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  /** Fetch appointment details only for its owner unless the caller is an admin. */
  async findById(id: string, userId?: string, admin = false) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        quoteRequest: {
          include: {
            service: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin && (!userId || appointment.quoteRequest.userId !== userId)) {
      throw new NotFoundException('Appointment not found.');
    }

    return appointment;
  }

  /** Validate schedule and quote ownership before creating the unique booking. */
  async create(dto: CreateAppointmentDto, userId?: string, admin = false) {
    const schedule = this.parseSchedule(dto);
    const quoteRequest = await this.prisma.quoteRequest.findUnique({
      where: { id: dto.quoteRequestId },
      include: { service: true },
    });

    if (!quoteRequest) {
      throw new NotFoundException('Quote request not found.');
    }

    if (!admin && (!userId || quoteRequest.userId !== userId)) {
      throw new NotFoundException('Quote request not found.');
    }

    const existing = await this.prisma.appointment.findUnique({
      where: { quoteRequestId: dto.quoteRequestId },
    });

    if (existing) {
      throw new ConflictException(
        'A booking already exists for this quote request.',
      );
    }

    try {
      return await this.prisma.appointment.create({
        data: {
          quoteRequestId: dto.quoteRequestId,
          scheduledDate: schedule.date,
          startTime: schedule.start,
          endTime: schedule.end,
          notes: dto.notes?.trim() || null,
          status: 'REQUESTED',
        },
        include: { quoteRequest: { include: { service: true } } },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          'A booking already exists for this quote request.',
        );
      }
      throw error;
    }
  }

  /** Cancel an active appointment while guarding against concurrent status changes. */
  async cancel(id: string, userId?: string, admin = false) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { quoteRequest: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin && (!userId || appointment.quoteRequest.userId !== userId)) {
      throw new NotFoundException('Appointment not found.');
    }

    if (
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED'
    ) {
      throw new BadRequestException(
        'This appointment cannot be cancelled in its current status.',
      );
    }

    // Match the previously read status to prevent a stale cancellation from
    // overwriting a simultaneous admin status update.
    const result = await this.prisma.appointment.updateMany({
      where: { id, status: appointment.status },
      data: { status: 'CANCELLED' },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'The appointment status changed. Refresh and try again.',
      );
    }
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  /** Enforce administrator access and permit only defined status transitions. */
  async updateStatus(
    id: string,
    dto: UpdateAppointmentStatusDto,
    admin = false,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found.');
    }

    if (!admin) {
      throw new UnauthorizedException(
        'Only administrators can update appointment status.',
      );
    }

    // Terminal statuses have no outgoing transitions.
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

    const result = await this.prisma.appointment.updateMany({
      where: { id, status: appointment.status },
      data: { status: dto.status },
    });
    if (result.count === 0) {
      throw new BadRequestException(
        'The appointment status changed. Refresh and try again.',
      );
    }
    return this.prisma.appointment.findUnique({
      where: { id },
      include: { quoteRequest: { include: { service: true } } },
    });
  }

  /** Return all appointments with service and minimal customer details for admins. */
  async findAllAdmin() {
    return this.prisma.appointment.findMany({
      orderBy: { scheduledDate: 'asc' },
      include: {
        quoteRequest: {
          include: {
            service: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  /** Parse ISO date/time input and reject invalid dates or non-increasing time ranges. */
  private parseSchedule(dto: CreateAppointmentDto) {
    const date = new Date(`${dto.scheduledDate}T00:00:00.000Z`);
    const start = new Date(`1970-01-01T${dto.startTime}:00.000Z`);
    const end = new Date(`1970-01-01T${dto.endTime}:00.000Z`);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== dto.scheduledDate ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.getTime() >= end.getTime()
    ) {
      throw new BadRequestException(
        'A valid date and increasing appointment times are required.',
      );
    }
    return { date, start, end };
  }
}
