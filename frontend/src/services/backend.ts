import axios from 'axios'
import api from '@/services/api'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(' ')
    if (message) return message
  }
  return fallback
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: 'CUSTOMER' | 'ADMIN'
}

export type CleaningService = {
  id: string
  name: string
  description: string
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'SPECIALTY'
  startingPrice: number | string | null
  estimatedDurationMinutes: number
}

export type QuoteRequest = {
  id: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string | null
  service: CleaningService
  propertyType: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER'
  streetAddress: string
  city: string
  state: string
  postalCode: string
  status: 'PENDING' | 'CONTACTED' | 'QUOTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
  preferredDate: string | null
  preferredTime: string | null
  notes: string | null
}

export type Appointment = {
  id: string
  quoteRequestId: string
  scheduledDate: string
  startTime: string
  endTime: string
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes: string | null
  quoteRequest: QuoteRequest
}

export type PublicReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  appointment: {
    quoteRequest: {
      customerFirstName: string
      service: CleaningService
    }
  }
}

export type QuoteRequestInput = {
  service: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone?: string
  propertyType: QuoteRequest['propertyType']
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
  streetAddress: string
  city: string
  state: string
  postalCode: string
  preferredDate?: string
  preferredTime?: string
  notes?: string
}

export async function fetchServices() {
  const response = await api.get<CleaningService[]>('/services', {
    params: { isActive: true },
  })
  return response.data
}

export async function createQuote(input: QuoteRequestInput) {
  const response = await api.post<QuoteRequest>('/quote-requests', input)
  return response.data
}

export async function createContactMessage(input: {
  customerName: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  const response = await api.post('/contact-messages', input)
  return response.data
}

export async function fetchPublicReviews() {
  const response = await api.get<PublicReview[]>('/reviews')
  return response.data
}

export async function login(input: { email: string; password: string }) {
  const response = await api.post<{ token: string; user: User }>('/auth/login', input)
  return response.data
}

export async function register(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}) {
  const response = await api.post<{ token: string; user: User }>('/auth/register', input)
  return response.data
}

export async function fetchCurrentUser() {
  const response = await api.get<User>('/auth/me')
  return response.data
}

export async function fetchMyQuotes() {
  const response = await api.get<QuoteRequest[]>('/quote-requests/me')
  return response.data
}

export async function cancelQuote(id: string) {
  const response = await api.post<QuoteRequest>(`/quote-requests/${id}/cancel`)
  return response.data
}

export async function fetchMyAppointments() {
  const response = await api.get<Appointment[]>('/appointments/me')
  return response.data
}

export async function createAppointment(input: {
  quoteRequestId: string
  scheduledDate: string
  startTime: string
  endTime: string
  notes?: string
}) {
  const response = await api.post<Appointment>('/appointments', input)
  return response.data
}

export async function cancelAppointment(id: string) {
  const response = await api.post<Appointment>(`/appointments/${id}/cancel`)
  return response.data
}

export async function createReview(input: {
  appointmentId: string
  rating: number
  comment?: string
}) {
  const response = await api.post('/reviews', input)
  return response.data
}
