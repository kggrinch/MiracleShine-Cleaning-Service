export type Review = {
  name: string
  title: string
  quote: string
}

/**
 * Representative client feedback shared by the home page carousel and the
 * reviews page. Names are abbreviated to protect client privacy - replace the
 * entries below with real testimonials as they become available.
 */
export const reviews: Review[] = [
  {
    name: 'Maria T.',
    title: 'Homeowner',
    quote: 'The team was punctual, thoughtful, and left every room sparkling. It feels like a fresh start every time.',
  },
  {
    name: 'Jason & Lauren',
    title: 'Property Managers',
    quote: 'Their attention to detail and communication make them our go-to cleaning partner for every turnover.',
  },
  {
    name: 'Diana P.',
    title: 'Office Manager',
    quote: 'Professional, reliable, and polished. Our office always feels welcoming after each visit.',
  },
  {
    name: 'Sam R.',
    title: 'Small Business Owner',
    quote: 'They fit around our schedule seamlessly and keep the storefront looking sharp and inviting.',
  },
  {
    name: 'Emily C.',
    title: 'Realtor',
    quote: 'Their move-out service means every property is ready for showings with zero last-minute stress.',
  },
  {
    name: 'Derek M.',
    title: 'Restaurant Owner',
    quote: 'Clean, respectful, and consistent - exactly what you need when your space hosts people all day.',
  },
]

export const overallRating = 4.9