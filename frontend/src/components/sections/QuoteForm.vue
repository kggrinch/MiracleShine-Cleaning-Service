<script setup lang="ts">
import { reactive, ref } from 'vue'
import axios from 'axios'
import { CircleCheck, Mail, Phone, Send } from 'lucide-vue-next'
import api from '@/services/api'

type FormState = {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  postalCode: string
  propertyType: string
  service: string
  message: string
}

const form = reactive<FormState>({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  propertyType: 'HOUSE',
  service: 'Commercial Cleaning',
  message: '',
})

const errors = reactive<Partial<Record<keyof FormState, string>>>({})
const submitted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): Partial<Record<keyof FormState, string>> {
  const next: Partial<Record<keyof FormState, string>> = {}
  if (!form.firstName.trim()) next.firstName = 'Please enter your first name.'
  if (!form.lastName.trim()) next.lastName = 'Please enter your last name.'
  if (!form.phone.trim()) next.phone = 'Please enter a phone number.'
  if (!form.email.trim()) next.email = 'Please enter your email address.'
  else if (!emailRe.test(form.email)) next.email = 'Please enter a valid email address.'
  if (!form.address.trim()) next.address = 'Please enter the service address.'
  if (!form.city.trim()) next.city = 'Please enter the city.'
  if (!form.state.trim()) next.state = 'Please enter the state.'
  if (!form.postalCode.trim()) next.postalCode = 'Please enter the ZIP or postal code.'
  if (!form.message.trim()) next.message = 'Tell us a little about your space and needs.'
  return next
}

async function onSubmit() {
  if (isSubmitting.value) return
  submitted.value = false
  submitError.value = ''
  const next = validate()
  ;(Object.keys(errors) as (keyof FormState)[]).forEach((key) => {
    errors[key] = undefined
  })
  Object.assign(errors, next)
  if (Object.values(next).some(Boolean)) return

  isSubmitting.value = true
  try {
    await api.post('/quote-requests', {
      customerFirstName: form.firstName.trim(),
      customerLastName: form.lastName.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      service: form.service,
      propertyType: form.propertyType,
      streetAddress: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      notes: form.message.trim(),
    })
    submitted.value = true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message: unknown = error.response?.data?.message
      submitError.value = Array.isArray(message)
        ? message.join(' ')
        : typeof message === 'string'
          ? message
          : 'We could not submit your request. Please try again.'
    } else {
      submitError.value = 'We could not submit your request. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.firstName = ''
  form.lastName = ''
  form.phone = ''
  form.email = ''
  form.address = ''
  form.city = ''
  form.state = ''
  form.postalCode = ''
  form.propertyType = 'HOUSE'
  form.service = 'Commercial Cleaning'
  form.message = ''
  ;(Object.keys(errors) as (keyof FormState)[]).forEach((key) => {
    errors[key] = undefined
  })
  submitted.value = false
  submitError.value = ''
}
</script>

<template>
  <section id="quote" class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <div
      class="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-28px_rgba(2,8,23,0.65)] lg:grid-cols-[0.9fr_1.1fr] lg:p-12"
    >
      <div class="flex flex-col justify-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Free quote</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get your free cleaning quote today.
        </h2>
        <p class="mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Share a few details about your property and preferred service, and we’ll follow up with a
          tailored estimate that fits your schedule and standards.
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

      <form
        class="rounded-[2rem] bg-white p-6 text-slate-900 shadow-xl shadow-black/10 sm:p-8"
        :aria-busy="isSubmitting"
        @submit.prevent="onSubmit"
        novalidate
      >
        <div
          v-if="submitted"
          class="flex min-h-[26rem] flex-col items-center justify-center gap-4 text-center"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-primary"
          >
            <CircleCheck class="h-8 w-8" />
          </div>
          <h3 class="text-2xl font-semibold text-slate-900">Request received</h3>
          <p class="max-w-md text-slate-600">
            Thanks, {{ form.firstName || 'there' }}! We've received your details and will follow up
            with a tailored estimate shortly.
          </p>
          <button
            type="button"
            class="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            @click="resetForm"
          >
            Submit another request
          </button>
        </div>

        <template v-else>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-first-name">
                First Name
                <input
                  id="quote-first-name"
                  v-model="form.firstName"
                  type="text"
                  autocomplete="given-name"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  :class="errors.firstName ? 'border-red-300 focus:border-red-400' : ''"
                  placeholder="Jordan"
                />
              </label>
              <p v-if="errors.firstName" class="text-sm text-red-600" role="alert">
                {{ errors.firstName }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-last-name">
                Last Name
                <input
                  id="quote-last-name"
                  v-model="form.lastName"
                  type="text"
                  autocomplete="family-name"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  :class="errors.lastName ? 'border-red-300 focus:border-red-400' : ''"
                  placeholder="Lee"
                />
              </label>
              <p v-if="errors.lastName" class="text-sm text-red-600" role="alert">
                {{ errors.lastName }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-phone">
                Phone
                <input
                  id="quote-phone"
                  v-model="form.phone"
                  type="tel"
                  autocomplete="tel"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  :class="errors.phone ? 'border-red-300 focus:border-red-400' : ''"
                  placeholder="(555) 123-4567"
                />
              </label>
              <p v-if="errors.phone" class="text-sm text-red-600" role="alert">
                {{ errors.phone }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-email">
                Email
                <input
                  id="quote-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  :class="errors.email ? 'border-red-300 focus:border-red-400' : ''"
                  placeholder="you@example.com"
                />
              </label>
              <p v-if="errors.email" class="text-sm text-red-600" role="alert">
                {{ errors.email }}
              </p>
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-address">
                Address
                <input
                  id="quote-address"
                  v-model="form.address"
                  type="text"
                  autocomplete="street-address"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  :class="errors.address ? 'border-red-300 focus:border-red-400' : ''"
                  placeholder="123 Main Street"
                />
              </label>
              <p v-if="errors.address" class="text-sm text-red-600" role="alert">
                {{ errors.address }}
              </p>
            </div>

            <label class="block text-sm font-medium text-slate-700" for="quote-service">
              Cleaning Type
              <select
                id="quote-service"
                v-model="form.service"
                class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              >
                <option>Residential Cleaning</option>
                <option>Commercial Cleaning</option>
                <option>Deep Cleaning</option>
                <option>Move In / Move Out Cleaning</option>
                <option>Disinfecting and Sanitizing</option>
                <option>Post Construction Cleaning</option>
                <option>Carpet Cleaning</option>
                <option>Office Cleaning</option>
                <option>Specialty Cleaning</option>
              </select>
            </label>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="block text-sm font-medium text-slate-700" for="quote-property-type">
              Property Type
              <select
                id="quote-property-type"
                v-model="form.propertyType"
                class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              >
                <option value="HOUSE">House</option>
                <option value="APARTMENT">Apartment</option>
                <option value="OFFICE">Office</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-city">
                City
                <input
                  id="quote-city"
                  v-model="form.city"
                  type="text"
                  autocomplete="address-level2"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  placeholder="Seattle"
                />
              </label>
              <p v-if="errors.city" class="text-sm text-red-600" role="alert">{{ errors.city }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-state">
                State
                <input
                  id="quote-state"
                  v-model="form.state"
                  type="text"
                  autocomplete="address-level1"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  placeholder="WA"
                />
              </label>
              <p v-if="errors.state" class="text-sm text-red-600" role="alert">
                {{ errors.state }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="quote-postal-code">
                ZIP / Postal Code
                <input
                  id="quote-postal-code"
                  v-model="form.postalCode"
                  type="text"
                  autocomplete="postal-code"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  placeholder="98101"
                />
              </label>
              <p v-if="errors.postalCode" class="text-sm text-red-600" role="alert">
                {{ errors.postalCode }}
              </p>
            </div>
          </div>

          <label class="mt-4 block text-sm font-medium text-slate-700" for="quote-message">
            Message
            <textarea
              id="quote-message"
              v-model="form.message"
              class="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              :class="errors.message ? 'border-red-300 focus:border-red-400' : ''"
              placeholder="Tell us about your space and scheduling needs."
            />
          </label>
          <p v-if="errors.message" class="text-sm text-red-600" role="alert">
            {{ errors.message }}
          </p>
          <p v-if="submitError" class="mt-4 text-sm text-red-600" role="alert">{{ submitError }}</p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {{ isSubmitting ? 'Submitting…' : 'Request Quote' }}
            <Send v-if="!isSubmitting" class="h-4 w-4" />
          </button>
        </template>
      </form>
    </div>
  </section>
</template>
