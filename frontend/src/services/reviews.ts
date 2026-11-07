import api from '@/services/api'

export type PublicReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  appointment: {
    quoteRequest: {
      customerFirstName: string
      service: { name: string }
    }
  }
}

export async function fetchPublicReviews(): Promise<PublicReview[]> {
  const { data } = await api.get<PublicReview[]>('/reviews')
  return data
}

export function getPublicReviewerName(review: PublicReview): string {
  const firstName = review.appointment.quoteRequest.customerFirstName.trim()
  return firstName ? `${firstName.charAt(0)}.` : 'Verified customer'
}
