<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CircleCheck, Mail, Phone, Send } from 'lucide-vue-next'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import { fetchPublicServices, type CleaningService } from '@/data/services'
import { getApiErrorMessage } from '@/services/errors'

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
  serviceId: string
  squareFootage: string
  bedrooms: string
  bathrooms: string
  preferredDate: string
  preferredTime: string
  message: string
}

const props = defineProps<{ serviceId?: string }>()
const residentialPropertyTypes = ['HOUSE', 'APARTMENT']
const services = ref<CleaningService[]>([])
const isLoadingServices = ref(true)
const serviceLoadError = ref('')

const form = reactive<FormState>({
  firstName: currentUser.value?.firstName ?? '',
  lastName: currentUser.value?.lastName ?? '',
  phone: currentUser.value?.phone ?? '',
  email: currentUser.value?.email ?? '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  propertyType: 'HOUSE',
  serviceId: '',
  squareFootage: '',
  bedrooms: '',
  bathrooms: '',
  preferredDate: '',
  preferredTime: '',
  message: '',
})

const selectedService = computed(() =>
  services.value.find((service) => service.id === form.serviceId),
)

const errors = reactive<Partial<Record<keyof FormState, string>>>({})
const submitted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(
  () => form.propertyType,
  (propertyType) => {
    if (!residentialPropertyTypes.includes(propertyType)) {
      form.bedrooms = ''
      form.bathrooms = ''
      errors.bedrooms = undefined
      errors.bathrooms = undefined
    }
  },
)

watch(
  () => props.serviceId,
  (serviceId) => {
    if (serviceId && services.value.some((service) => service.id === serviceId)) {
      form.serviceId = serviceId
    }
  },
)

onMounted(async () => {
  try {
    services.value = await fetchPublicServices()
    const requestedServiceId = props.serviceId ?? ''
    form.serviceId = services.value.some((service) => service.id === requestedServiceId)
      ? requestedServiceId
      : (services.value[0]?.id ?? '')
  } catch (error) {
    serviceLoadError.value = getApiErrorMessage(
      error,
      'Services could not be loaded. Please try again later.',
    )
  } finally {
    isLoadingServices.value = false
  }
})

function validate(): Partial<Record<keyof FormState, string>> {
  const next: Partial<Record<keyof FormState, string>> = {}
  if (form.firstName.trim().length < 2 || form.firstName.trim().length > 100)
    next.firstName = 'Enter between 2 and 100 characters.'
  if (form.lastName.trim().length < 2 || form.lastName.trim().length > 100)
    next.lastName = 'Enter between 2 and 100 characters.'
  if (form.phone.trim().length > 30) next.phone = 'Phone number must be 30 characters or fewer.'
  if (!form.email.trim()) next.email = 'Please enter your email address.'
  else if (form.email.trim().length > 255 || !emailRe.test(form.email.trim()))
    next.email = 'Please enter a valid email address.'
  if (form.address.trim().length < 3 || form.address.trim().length > 255)
    next.address = 'Enter between 3 and 255 characters.'
  if (form.city.trim().length < 2 || form.city.trim().length > 100)
    next.city = 'Enter between 2 and 100 characters.'
  if (form.state.trim().length < 2 || form.state.trim().length > 100)
    next.state = 'Enter between 2 and 100 characters.'
  if (form.postalCode.trim().length < 3 || form.postalCode.trim().length > 20)
    next.postalCode = 'Enter between 3 and 20 characters.'
  if (form.message.trim().length > 5000) next.message = 'Message must be 5,000 characters or fewer.'
  if (!services.value.some((service) => service.id === form.serviceId))
    next.serviceId = 'Choose an available service.'
  if (
    form.squareFootage !== '' &&
    (!/^\d+$/.test(form.squareFootage) || Number(form.squareFootage) > 2147483647)
  ) {
    next.squareFootage = 'Enter a whole number between 0 and 2,147,483,647.'
  }
  if (
    residentialPropertyTypes.includes(form.propertyType) &&
    form.bedrooms !== '' &&
    (!/^\d+$/.test(form.bedrooms) || Number(form.bedrooms) > 2147483647)
  ) {
    next.bedrooms = 'Enter a whole number between 0 and 2,147,483,647.'
  }
  if (
    residentialPropertyTypes.includes(form.propertyType) &&
    form.bathrooms !== '' &&
    (!/^\d+(?:\.\d)?$/.test(form.bathrooms) || Number(form.bathrooms) > 50)
  ) {
    next.bathrooms = 'Enter a number from 0 to 50 with at most one decimal place.'
  }
  if (form.preferredDate && form.preferredDate < getLocalDateString()) {
    next.preferredDate = 'Choose today or a future date.'
  }
  if (form.preferredTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.preferredTime)) {
    next.preferredTime = 'Choose a valid preferred time.'
  }
  return next
}

function getLocalDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
      serviceId: form.serviceId,
      customerFirstName: form.firstName.trim(),
      customerLastName: form.lastName.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      propertyType: form.propertyType,
      ...(form.squareFootage !== '' ? { squareFootage: Number(form.squareFootage) } : {}),
      ...(residentialPropertyTypes.includes(form.propertyType) && form.bedrooms !== ''
        ? { bedrooms: Number(form.bedrooms) }
        : {}),
      ...(residentialPropertyTypes.includes(form.propertyType) && form.bathrooms !== ''
        ? { bathrooms: Number(form.bathrooms) }
        : {}),
      streetAddress: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      ...(form.preferredDate ? { preferredDate: form.preferredDate } : {}),
      ...(form.preferredTime ? { preferredTime: form.preferredTime } : {}),
      notes: form.message.trim(),
    })
    submitted.value = true
  } catch (error) {
    submitError.value = getApiErrorMessage(
      error,
      'We could not submit your request. Please try again.',
    )
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.firstName = currentUser.value?.firstName ?? ''
  form.lastName = currentUser.value?.lastName ?? ''
  form.phone = currentUser.value?.phone ?? ''
  form.email = currentUser.value?.email ?? ''
  form.address = ''
  form.city = ''
  form.state = ''
  form.postalCode = ''
  form.propertyType = 'HOUSE'
  form.serviceId = services.value[0]?.id ?? ''
  form.squareFootage = ''
  form.bedrooms = ''
  form.bathrooms = ''
  form.preferredDate = ''
  form.preferredTime = ''
  form.message = ''
  ;(Object.keys(errors) as (keyof FormState)[]).forEach((key) => {
    errors[key] = undefined
  })
  submitted.value = false
  submitError.value = ''
}
</script>

<template>
  <section id="quote" class="mx-auto max-w-7xl px-0 py-12 sm:px-6 sm:py-16 lg:px-8">
    <div
      class="grid min-w-0 gap-8 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_-28px_rgba(2,8,23,0.65)] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12"
    >
      <div class="flex min-w-0 flex-col justify-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Free quote</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get your free cleaning quote today.
        </h2>
        <p class="mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Share a few details about your property and preferred service, and we’ll follow up with a
          tailored estimate that fits your schedule and standards.
        </p>

        <div class="mt-8 space-y-4">
          <div
            class="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4"
          >
            <Phone class="h-5 w-5 shrink-0 text-sky-300" />
            <span>(425) 555-1234</span>
          </div>
          <div
            class="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4"
          >
            <Mail class="h-5 w-5 shrink-0 text-sky-300" />
            <span class="min-w-0 break-all">info@miracleshinecleaning.com</span>
          </div>
        </div>
      </div>

      <form
        class="w-full min-w-0 rounded-[2rem] bg-white p-4 text-slate-900 shadow-xl shadow-black/10 sm:p-8"
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
          <p class="max-w-md text-slate-700">
            Thanks, {{ form.firstName || 'there' }}! Our team will review your request and contact
            you to discuss the details. This is a quote request, not a confirmed cleaning
            appointment.
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
          <div class="space-y-6">
            <section>
              <h3 class="text-lg font-semibold text-slate-900">Contact information</h3>
              <p class="mt-1 text-sm text-slate-500">
                Fields marked required are needed to follow up.
              </p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-first-name">
                    First name <span aria-hidden="true">*</span>
                    <input
                      id="quote-first-name"
                      v-model="form.firstName"
                      type="text"
                      maxlength="100"
                      autocomplete="given-name"
                      required
                      :aria-invalid="!!errors.firstName"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.firstName ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.firstName" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.firstName }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-last-name">
                    Last name <span aria-hidden="true">*</span>
                    <input
                      id="quote-last-name"
                      v-model="form.lastName"
                      type="text"
                      maxlength="100"
                      autocomplete="family-name"
                      required
                      :aria-invalid="!!errors.lastName"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.lastName ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.lastName" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.lastName }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-email">
                    Email address <span aria-hidden="true">*</span>
                    <input
                      id="quote-email"
                      v-model="form.email"
                      type="email"
                      maxlength="255"
                      autocomplete="email"
                      required
                      :aria-invalid="!!errors.email"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.email ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.email" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.email }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-phone">
                    Phone <span class="font-normal text-slate-500">(optional)</span>
                    <input
                      id="quote-phone"
                      v-model="form.phone"
                      type="tel"
                      maxlength="30"
                      autocomplete="tel"
                      :aria-invalid="!!errors.phone"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.phone ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.phone" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.phone }}
                  </p>
                </div>
              </div>
            </section>

            <section class="border-t border-slate-100 pt-5">
              <h3 class="text-lg font-semibold text-slate-900">Cleaning service</h3>
              <label class="mt-3 block text-sm font-medium text-slate-700" for="quote-service">
                Service <span aria-hidden="true">*</span>
                <select
                  id="quote-service"
                  v-model="form.serviceId"
                  required
                  :disabled="isLoadingServices || services.length === 0"
                  :aria-invalid="!!errors.serviceId"
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                  :class="errors.serviceId ? 'border-red-500' : ''"
                >
                  <option value="" disabled>
                    {{ isLoadingServices ? 'Loading services…' : 'Choose a service' }}
                  </option>
                  <option v-for="service in services" :key="service.id" :value="service.id">
                    {{ service.name }}
                  </option>
                </select>
              </label>
              <p v-if="errors.serviceId" class="mt-1 text-sm text-red-600" role="alert">
                {{ errors.serviceId }}
              </p>
              <p v-if="selectedService?.description" class="mt-2 text-sm leading-6 text-slate-600">
                {{ selectedService.description }}
              </p>
            </section>

            <section class="border-t border-slate-100 pt-5">
              <h3 class="text-lg font-semibold text-slate-900">Property information</h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="block text-sm font-medium text-slate-700" for="quote-property-type">
                  Property type <span aria-hidden="true">*</span>
                  <select
                    id="quote-property-type"
                    v-model="form.propertyType"
                    required
                    class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="OFFICE">Office</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700"
                    for="quote-square-footage"
                  >
                    Square footage <span class="font-normal text-slate-500">(optional)</span>
                    <input
                      id="quote-square-footage"
                      v-model="form.squareFootage"
                      type="number"
                      min="0"
                      max="2147483647"
                      step="1"
                      inputmode="numeric"
                      :aria-invalid="!!errors.squareFootage"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.squareFootage ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.squareFootage" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.squareFootage }}
                  </p>
                </div>
                <template v-if="residentialPropertyTypes.includes(form.propertyType)">
                  <div>
                    <label class="block text-sm font-medium text-slate-700" for="quote-bedrooms">
                      Bedrooms <span class="font-normal text-slate-500">(optional)</span>
                      <input
                        id="quote-bedrooms"
                        v-model="form.bedrooms"
                        type="number"
                        min="0"
                        max="2147483647"
                        step="1"
                        inputmode="numeric"
                        :aria-invalid="!!errors.bedrooms"
                        class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                        :class="errors.bedrooms ? 'border-red-500' : ''"
                      />
                    </label>
                    <p v-if="errors.bedrooms" class="mt-1 text-sm text-red-600" role="alert">
                      {{ errors.bedrooms }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700" for="quote-bathrooms">
                      Bathrooms <span class="font-normal text-slate-500">(optional)</span>
                      <input
                        id="quote-bathrooms"
                        v-model="form.bathrooms"
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        inputmode="decimal"
                        :aria-invalid="!!errors.bathrooms"
                        class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                        :class="errors.bathrooms ? 'border-red-500' : ''"
                      />
                    </label>
                    <p v-if="errors.bathrooms" class="mt-1 text-sm text-red-600" role="alert">
                      {{ errors.bathrooms }}
                    </p>
                  </div>
                </template>
                <p v-else class="self-center text-sm text-slate-500 sm:col-span-2">
                  Bedroom and bathroom details are only requested for residential properties.
                </p>
              </div>
            </section>

            <section class="border-t border-slate-100 pt-5">
              <h3 class="text-lg font-semibold text-slate-900">Property address</h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-slate-700" for="quote-address">
                    Street address <span aria-hidden="true">*</span>
                    <input
                      id="quote-address"
                      v-model="form.address"
                      type="text"
                      minlength="3"
                      maxlength="255"
                      autocomplete="street-address"
                      required
                      :aria-invalid="!!errors.address"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.address ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.address" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.address }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-city">
                    City <span aria-hidden="true">*</span>
                    <input
                      id="quote-city"
                      v-model="form.city"
                      type="text"
                      minlength="2"
                      maxlength="100"
                      autocomplete="address-level2"
                      required
                      :aria-invalid="!!errors.city"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.city ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.city" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.city }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-state">
                    State / region <span aria-hidden="true">*</span>
                    <input
                      id="quote-state"
                      v-model="form.state"
                      type="text"
                      minlength="2"
                      maxlength="100"
                      autocomplete="address-level1"
                      required
                      :aria-invalid="!!errors.state"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.state ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.state" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.state }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-postal-code">
                    Postal code <span aria-hidden="true">*</span>
                    <input
                      id="quote-postal-code"
                      v-model="form.postalCode"
                      type="text"
                      minlength="3"
                      maxlength="20"
                      autocomplete="postal-code"
                      required
                      :aria-invalid="!!errors.postalCode"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.postalCode ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.postalCode" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.postalCode }}
                  </p>
                </div>
              </div>
            </section>

            <section class="border-t border-slate-100 pt-5">
              <h3 class="text-lg font-semibold text-slate-900">Preferred cleaning schedule</h3>
              <p class="mt-1 text-sm text-slate-500">
                These are preferences for discussion, not a confirmed appointment.
              </p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700"
                    for="quote-preferred-date"
                  >
                    Preferred date <span class="font-normal text-slate-500">(optional)</span>
                    <input
                      id="quote-preferred-date"
                      v-model="form.preferredDate"
                      type="date"
                      :min="getLocalDateString()"
                      :aria-invalid="!!errors.preferredDate"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.preferredDate ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.preferredDate" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.preferredDate }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700" for="quote-preferred-time">
                    Preferred time <span class="font-normal text-slate-500">(optional)</span>
                    <input
                      id="quote-preferred-time"
                      v-model="form.preferredTime"
                      type="time"
                      :aria-invalid="!!errors.preferredTime"
                      class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                      :class="errors.preferredTime ? 'border-red-500' : ''"
                    />
                  </label>
                  <p v-if="errors.preferredTime" class="mt-1 text-sm text-red-600" role="alert">
                    {{ errors.preferredTime }}
                  </p>
                </div>
              </div>
            </section>

            <section class="border-t border-slate-100 pt-5">
              <h3 class="text-lg font-semibold text-slate-900">Additional information</h3>
              <label class="mt-3 block text-sm font-medium text-slate-700" for="quote-message">
                Notes <span class="font-normal text-slate-500">(optional)</span>
                <textarea
                  id="quote-message"
                  v-model="form.message"
                  maxlength="5000"
                  rows="4"
                  class="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-sky-200"
                  :class="errors.message ? 'border-red-500' : ''"
                  placeholder="Share special requests, cleaning priorities, property conditions, access instructions, or anything else that could help us prepare an accurate quote."
                />
              </label>
              <p v-if="errors.message" class="mt-1 text-sm text-red-600" role="alert">
                {{ errors.message }}
              </p>
            </section>
          </div>
          <p v-if="serviceLoadError" class="mt-2 text-sm text-red-700" role="alert">
            {{ serviceLoadError }}
          </p>
          <p v-else-if="isLoadingServices" class="mt-2 text-sm text-slate-500" role="status">
            Loading available services…
          </p>
          <p v-if="submitError" class="mt-4 text-sm text-red-600" role="alert">{{ submitError }}</p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {{ isSubmitting ? 'Submitting…' : 'Request a Quote' }}
            <Send v-if="!isSubmitting" class="h-4 w-4" />
          </button>
        </template>
      </form>
    </div>
  </section>
</template>
