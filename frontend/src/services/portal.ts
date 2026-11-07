import type { CleaningService } from '@/services/catalog'

export type QuoteStatus =
  | 'PENDING'
  | 'CONTACTED'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COMPLETED'

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export type Appointment = {
  id: string
  quoteRequestId: string
  scheduledDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null
}

export type QuoteRequest = {
  id: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string | null
  propertyType: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER'
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | string | null
  streetAddress: string
  city: string
  state: string
  postalCode: string
  preferredDate: string | null
  preferredTime: string | null
  notes: string | null
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  service: CleaningService
  appointment?: Appointment | null
  user?: { id: string; firstName: string; lastName: string; email: string; phone: string | null } | null
}

export type ContactMessage = {
  id: string
  customerName: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'NEW' | 'READ' | 'RESPONDED' | 'CLOSED'
  createdAt: string
}

export type AppointmentRecord = Appointment & {
  quoteRequest: QuoteRequest
}

export type AdminReview = {
  id: string
  rating: number
  comment: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  appointment: {
    quoteRequest: {
      customerFirstName: string
      customerLastName: string
      service: CleaningService
    }
  }
}

export const quoteStatuses: QuoteStatus[] = [
  'PENDING',
  'CONTACTED',
  'QUOTED',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED',
]

export const quoteTransitions: Record<QuoteStatus, QuoteStatus[]> = {
  PENDING: ['CONTACTED', 'QUOTED', 'ACCEPTED', 'DECLINED', 'COMPLETED'],
  CONTACTED: ['QUOTED', 'ACCEPTED', 'DECLINED', 'COMPLETED'],
  QUOTED: ['ACCEPTED', 'DECLINED', 'COMPLETED'],
  ACCEPTED: ['COMPLETED'],
  DECLINED: [],
  COMPLETED: [],
}
