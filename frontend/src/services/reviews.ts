import api from '@/services/api'

export type PublicReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  customerName: string | null
  user: { firstName: string; lastName: string } | null
}

export async function fetchPublicReviews(): Promise<PublicReview[]> {
  const { data } = await api.get<PublicReview[]>('/reviews')
  return data
}

export function getPublicReviewerName(review: PublicReview): string {
  const name = review.customerName?.trim()
  if (name) return `${name.charAt(0)}.`
  const firstName = review.user?.firstName?.trim()
  return firstName ? `${firstName.charAt(0)}.` : 'Verified customer'
}
