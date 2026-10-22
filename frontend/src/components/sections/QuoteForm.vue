<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { CircleCheck, Mail, Phone, Send } from 'lucide-vue-next'
import {
  createQuote,
  fetchServices,
  getApiErrorMessage,
  type CleaningService,
  type QuoteRequestInput,
} from '@/services/backend'

type FormState = Omit<QuoteRequestInput, 'squareFootage' | 'bedrooms' | 'bathrooms'> & {
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
}

const form = reactive<FormState>({
  customerFirstName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  propertyType: 'HOUSE',
  service: '',
  notes: '',
})

const services = ref<CleaningService[]>([])
const servicesLoading = ref(true)
const servicesError = ref('')
const errors = reactive<Partial<Record<keyof FormState, string>>>({})
const requestError = ref('')
const submitted = ref(false)
const submitting = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

onMounted(async () => {
  try {
    services.value = await fetchServices()
  } catch (error) {
    servicesError.value = getApiErrorMessage(error, 'We could not load cleaning services. Please try again later.')
  } finally {
    servicesLoading.value = false
  }
})

function validate(): Partial<Record<keyof FormState, string>> {
  const next: Partial<Record<keyof FormState, string>> = {}
  if (form.customerFirstName.trim().length < 2) next.customerFirstName = 'Enter at least 2 characters.'
  if (form.customerLastName.trim().length < 2) next.customerLastName = 'Enter at least 2 characters.'
  if (!form.customerEmail.trim()) next.customerEmail = 'Please enter your email address.'
  else if (!emailRe.test(form.customerEmail)) next.customerEmail = 'Please enter a valid email address.'
  if (!form.streetAddress.trim() || form.streetAddress.trim().length < 3) next.streetAddress = 'Enter a street address.'
  if (form.city.trim().length < 2) next.city = 'Enter a city.'
  if (form.state.trim().length < 2) next.state = 'Enter a state or region.'
  if (form.postalCode.trim().length < 3) next.postalCode = 'Enter a valid postal code.'
  if (!form.service) next.service = 'Choose a cleaning service.'
  return next
}

async function onSubmit() {
  submitted.value = false
  requestError.value = ''
  const next = validate()
  Object.keys(errors).forEach((key) => {
    errors[key as keyof FormState] = undefined
  })
  Object.assign(errors, next)
  if (Object.values(next).some(Boolean)) return

  submitting.value = true
  try {
    await createQuote({
      ...form,
      customerFirstName: form.customerFirstName.trim(),
      customerLastName: form.customerLastName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerPhone: form.customerPhone?.trim() || undefined,
      streetAddress: form.streetAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      squareFootage: form.squareFootage,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      notes: form.notes?.trim() || undefined,
      preferredDate: form.preferredDate || undefined,
      preferredTime: form.preferredTime || undefined,
    })
    submitted.value = true
  } catch (error) {
    requestError.value = getApiErrorMessage(error, 'Your quote request could not be submitted. Please try again.')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    customerEmail: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    propertyType: 'HOUSE',
    service: '',
    squareFootage: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    preferredDate: undefined,
    preferredTime: undefined,
    notes: '',
  })
  Object.keys(errors).forEach((key) => {
    errors[key as keyof FormState] = undefined
  })
  submitted.value = false
  requestError.value = ''
}
</script>

<template>
  <section id="quote" class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <div class="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-28px_rgba(2,8,23,0.65)] lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
      <div class="flex flex-col justify-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Free quote</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get your free cleaning quote today.
        </h2>
        <p class="mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Share a few details about your property and preferred service, and we’ll follow up with a tailored estimate that fits your schedule and standards.
        </p>

        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <Phone class="h-5 w-5 text-sky-300" />
            <span>(425) 555-1234</span>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <Mail class="h-5 w-5 text-sky-300" />
            <span>info@miracleshinecleaning.com</span>
          </div>
        </div>
      </div>

      <form class="rounded-[2rem] bg-white p-6 text-slate-900 shadow-xl shadow-black/10 sm:p-8" @submit.prevent="onSubmit" novalidate>
        <div v-if="submitted" class="flex min-h-[26rem] flex-col items-center justify-center gap-4 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-primary">
            <CircleCheck class="h-8 w-8" />
          </div>
          <h3 class="text-2xl font-semibold text-slate-900">Request received</h3>
          <p class="max-w-md text-slate-600">
            Thanks, {{ form.customerFirstName }}! Your quote request was sent. We’ll follow up with a tailored estimate.
          </p>
          <button type="button" class="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark" @click="resetForm">
            Submit another request
          </button>
        </div>

        <template v-else>
          <div v-if="requestError" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {{ requestError }}
          </div>
          <div v-if="servicesError" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {{ servicesError }}
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-first-name">
                First name
                <input id="quote-first-name" v-model="form.customerFirstName" type="text" autocomplete="given-name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              </label>
              <p v-if="errors.customerFirstName" class="text-sm text-red-600" role="alert">{{ errors.customerFirstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-last-name">
                Last name
                <input id="quote-last-name" v-model="form.customerLastName" type="text" autocomplete="family-name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              </label>
              <p v-if="errors.customerLastName" class="text-sm text-red-600" role="alert">{{ errors.customerLastName }}</p>
            </div>
            <label class="block text-sm font-medium text-slate-700" for="quote-phone">
              Phone
              <input id="quote-phone" v-model="form.customerPhone" type="tel" autocomplete="tel" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="(555) 123-4567" />
            </label>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-email">
                Email
                <input id="quote-email" v-model="form.customerEmail" type="email" autocomplete="email" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              </label>
              <p v-if="errors.customerEmail" class="text-sm text-red-600" role="alert">{{ errors.customerEmail }}</p>
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-700" for="quote-address">
              Street address
              <input id="quote-address" v-model="form.streetAddress" type="text" autocomplete="street-address" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              <span v-if="errors.streetAddress" class="text-sm text-red-600" role="alert">{{ errors.streetAddress }}</span>
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-service">
              Cleaning service
              <select id="quote-service" v-model="form.service" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" :disabled="servicesLoading || services.length === 0">
                <option value="" disabled>{{ servicesLoading ? 'Loading services…' : 'Select a service' }}</option>
                <option v-for="service in services" :key="service.id" :value="service.name">{{ service.name }}</option>
              </select>
              <span v-if="errors.service" class="text-sm text-red-600" role="alert">{{ errors.service }}</span>
              <span v-else-if="!servicesLoading && !servicesError && services.length === 0" class="text-sm text-slate-500">No services are currently available.</span>
            </label>
          </div>

          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label class="block text-sm font-medium text-slate-700" for="quote-city">
              City
              <input id="quote-city" v-model="form.city" type="text" autocomplete="address-level2" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              <span v-if="errors.city" class="text-sm text-red-600" role="alert">{{ errors.city }}</span>
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-state">
              State
              <input id="quote-state" v-model="form.state" type="text" autocomplete="address-level1" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              <span v-if="errors.state" class="text-sm text-red-600" role="alert">{{ errors.state }}</span>
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-postal">
              Postal code
              <input id="quote-postal" v-model="form.postalCode" type="text" autocomplete="postal-code" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
              <span v-if="errors.postalCode" class="text-sm text-red-600" role="alert">{{ errors.postalCode }}</span>
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-property">
              Property type
              <select id="quote-property" v-model="form.propertyType" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary">
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="OFFICE">Office</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
          </div>

          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label class="block text-sm font-medium text-slate-700" for="quote-square-footage">
              Square footage
              <input id="quote-square-footage" v-model.number="form.squareFootage" type="number" min="1" step="1" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-bedrooms">
              Bedrooms
              <input id="quote-bedrooms" v-model.number="form.bedrooms" type="number" min="0" step="1" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
            </label>
            <label class="block text-sm font-medium text-slate-700" for="quote-bathrooms">
              Bathrooms
              <input id="quote-bathrooms" v-model.number="form.bathrooms" type="number" min="0" max="99" step="0.5" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" />
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block text-sm font-medium text-slate-700" for="quote-date">
                Preferred date
                <input id="quote-date" v-model="form.preferredDate" type="date" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-primary" />
              </label>
              <label class="block text-sm font-medium text-slate-700" for="quote-time">
                Time
                <input id="quote-time" v-model="form.preferredTime" type="time" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-primary" />
              </label>
            </div>
          </div>

          <label class="mt-4 block text-sm font-medium text-slate-700" for="quote-message">
            Notes
            <textarea id="quote-message" v-model="form.notes" class="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="Tell us about your space and scheduling needs." />
          </label>

          <button type="submit" :disabled="submitting || servicesLoading || services.length === 0" class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
            {{ submitting ? 'Sending request…' : 'Request Quote' }}
            <Send class="h-4 w-4" />
          </button>
        </template>
      </form>
    </div>
  </section>
</template>
