import type { Component } from 'vue'
import {
  BriefcaseBusiness,
  Building2,
  Droplets,
  HardHat,
  House,
  Layers,
  Sparkles,
  Truck,
  Wand,
} from 'lucide-vue-next'

/**
 * Single source of truth for every service Miracle Shine offers.
 *
 * Both the home page ("featured" cards) and the services route (full grid)
 * consume this same array so service copy can never drift between pages.
 */
export type CleaningService = {
  /** URL-friendly slug used for deep links (`/services#slug`) and anchor ids. */
  slug: string
  title: string
  description: string
  /** Lucide icon rendered on the card. */
  icon: Component
  /** Highlights shown on the detailed services page card. */
  includes: string[]
  /** When true, the service also surfaces in the compact home page grid. */
  featured: boolean
}

export const services: CleaningService[] = [
  {
    slug: 'residential-cleaning',
    title: 'Residential Cleaning',
    description:
      'Dependable care for kitchens, bathrooms, living areas, and the thoughtful details that make your home feel brand new.',
    icon: House,
    includes: ['Kitchens & bathrooms', 'Living rooms & bedrooms', 'Dusting, vacuuming & mopping', 'Personalized care plans'],
    featured: true,
  },
  {
    slug: 'commercial-cleaning',
    title: 'Commercial Cleaning',
    description:
      'Consistent professional upkeep that keeps storefronts, shared spaces, and high-traffic areas looking polished every day.',
    icon: Building2,
    includes: ['Storefronts & lobbies', 'High-traffic common areas', 'Trash & recycling', 'Flexible recurring visits'],
    featured: true,
  },
  {
    slug: 'deep-cleaning',
    title: 'Deep Cleaning',
    description:
      'A meticulous reset for corners, baseboards, fixtures, and high-traffic rooms that deserve a level of serious attention.',
    icon: Sparkles,
    includes: ['Baseboards & trim', 'Light fixtures & vents', 'Interior glass', 'Detailed surface care'],
    featured: true,
  },
  {
    slug: 'move-in-out-cleaning',
    title: 'Move In / Move Out Cleaning',
    description:
      'A spotless turnover experience trusted by landlords, tenants, and property managers to end every move on the right note.',
    icon: Truck,
    includes: ['Full home or unit reset', 'Kitchens & bathrooms', 'Cabinets & appliances', 'Detailed final inspection'],
    featured: true,
  },
  {
    slug: 'disinfecting-sanitizing',
    title: 'Disinfecting & Sanitizing Services',
    description:
      'Elevated hygiene for high-touch points and shared environments, using effective, surface-safe cleaning methods.',
    icon: Droplets,
    includes: ['High-touch point care', 'Restroom & kitchen sanitizing', 'Door handles & switches', 'Health-conscious methods'],
    featured: true,
  },
  {
    slug: 'post-construction-cleaning',
    title: 'Post Construction Cleaning',
    description:
      'Remove dust, debris, and fine residues after construction or renovation so your refreshed space is genuinely move-in ready.',
    icon: HardHat,
    includes: ['Dust & debris removal', 'Window & sill detailing', 'Floor finish care', 'Final walk-through polish'],
    featured: false,
  },
  {
    slug: 'carpet-cleaning',
    title: 'Carpet Cleaning',
    description:
      'Refresh carpets and rugs with professional care that removes ground-in dirt and leaves every room feeling cleaner.',
    icon: Layers,
    includes: ['Vacuum & pre-treatment', 'Spot & stain attention', 'Fabric-aware methods', 'Fresh, finished look'],
    featured: false,
  },
  {
    slug: 'office-cleaning',
    title: 'Office Cleaning',
    description:
      'Flexible plans that keep reception areas, workstations, and common rooms welcoming for employees and guests alike.',
    icon: BriefcaseBusiness,
    includes: ['Reception & lobbies', 'Workstations & desks', 'Conference rooms', 'Breakroom upkeep'],
    featured: true,
  },
  {
    slug: 'special-service-cleaning',
    title: 'Special Service Cleaning',
    description:
      'Custom solutions for events, high-touch environments, and unique spaces that call for an extra level of attention.',
    icon: Wand,
    includes: ['Event prep & teardown', 'Custom service plans', 'Enhanced sanitizing', 'Satisfaction guarantee'],
    featured: false,
  },
]

/** Compact grid shown on the home page - a curated subset of the full service list. */
export const featuredServices = services.filter((service) => service.featured)