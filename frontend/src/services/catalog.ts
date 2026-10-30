import type { Component } from 'vue'
import {
  BriefcaseBusiness,
  Building2,
  House,
  Sparkles,
} from 'lucide-vue-next'
import api from '@/services/api'

export type ServiceCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'SPECIALTY'

export type CleaningService = {
  id: string
  name: string
  description: string
  category: ServiceCategory
  startingPrice: number | string | null
  estimatedDurationMinutes: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ServiceCardModel = CleaningService & {
  slug: string
  title: string
  icon: Component
  includes: string[]
  featured: boolean
}

const categoryIcons: Record<ServiceCategory, Component> = {
  RESIDENTIAL: House,
  COMMERCIAL: Building2,
  SPECIALTY: Sparkles,
}

export function toServiceCard(service: CleaningService, index = 0): ServiceCardModel {
  return {
    ...service,
    slug: service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: service.name,
    icon:
      service.category === 'COMMERCIAL' && index % 2 === 1
        ? BriefcaseBusiness
        : categoryIcons[service.category],
    includes: [],
    featured: index < 6,
  }
}

export async function fetchPublicServices(): Promise<CleaningService[]> {
  const { data } = await api.get<CleaningService[]>('/services')
  return data
}

export function formatServicePrice(price: CleaningService['startingPrice']): string {
  if (price === null) return 'Custom quote'
  const amount = Number(price)
  return Number.isFinite(amount) ? `From $${amount.toFixed(2)}` : 'Custom quote'
}
