import type { CleaningService } from '@/services/catalog'

export type QuoteStatus =
  | 'PENDING'
  | 'SENT'
  | 'REJECTED'

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
  notes: string | null
  status: QuoteStatus
  createdAt: string
  updatedAt: string
  service: CleaningService
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

export type AdminReview = {
  id: string
  rating: number
  comment: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  customerName: string | null
  user: { id: string; firstName: string; lastName: string; email: string } | null
}

export const quoteStatuses: QuoteStatus[] = [
  'PENDING',
  'SENT',
  'REJECTED',
]

export const quoteTransitions: Record<QuoteStatus, QuoteStatus[]> = {
  PENDING: ['SENT', 'REJECTED'],
  SENT: ['PENDING', 'REJECTED'],
  REJECTED: ['PENDING', 'SENT'],
}
