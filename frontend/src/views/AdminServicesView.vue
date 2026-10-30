<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import api from '@/services/api'
import type { CleaningService, ServiceCategory } from '@/services/catalog'
import { getApiErrorMessage } from '@/services/errors'

const services = ref<CleaningService[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editing = ref<CleaningService | null>(null)
const showForm = ref(false)

type ServiceForm = {
  name: string
  description: string
  category: ServiceCategory
  startingPrice: string
  estimatedDurationMinutes: string
  imageUrl: string
  isActive: boolean
}

const form = reactive<ServiceForm>({
  name: '',
  description: '',
  category: 'RESIDENTIAL',
  startingPrice: '',
  estimatedDurationMinutes: '60',
  imageUrl: '',
  isActive: true,
})

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.get<CleaningService[]>('/admin/services')
    services.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Services could not be loaded.')
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

function openCreate() {
  editing.value = null
  Object.assign(form, {
    name: '',
    description: '',
    category: 'RESIDENTIAL',
    startingPrice: '',
    estimatedDurationMinutes: '60',
    imageUrl: '',
    isActive: true,
  })
  showForm.value = true
  errorMessage.value = ''
}

function openEdit(service: CleaningService) {
  editing.value = service
  Object.assign(form, {
    name: service.name,
    description: service.description,
    category: service.category,
    startingPrice: service.startingPrice === null ? '' : String(service.startingPrice),
    estimatedDurationMinutes: String(service.estimatedDurationMinutes),
    imageUrl: service.imageUrl ?? '',
    isActive: service.isActive,
  })
  showForm.value = true
  errorMessage.value = ''
}

async function save() {
  if (isSaving.value) return
  errorMessage.value = ''
  successMessage.value = ''
  const startingPrice = form.startingPrice.trim()
  const duration = Number(form.estimatedDurationMinutes)
  if (form.name.trim().length < 2 || form.description.trim().length < 10) {
    errorMessage.value = 'Enter a service name (at least 2 characters) and description (at least 10 characters).'
    return
  }
  if (!Number.isInteger(duration) || duration < 1) {
    errorMessage.value = 'Estimated duration must be at least one minute.'
    return
  }
  if (startingPrice && (!Number.isFinite(Number(startingPrice)) || Number(startingPrice) < 0)) {
    errorMessage.value = 'Starting price must be a non-negative number.'
    return
  }
  if (startingPrice && !/^\d+(?:\.\d{1,2})?$/.test(startingPrice)) {
    errorMessage.value = 'Starting price can have at most two decimal places.'
    return
  }

  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    ...(startingPrice ? { startingPrice: Number(startingPrice) } : {}),
    estimatedDurationMinutes: duration,
    imageUrl: form.imageUrl.trim() || undefined,
    isActive: form.isActive,
  }
  isSaving.value = true
  try {
    if (editing.value) {
      await api.patch(`/services/${editing.value.id}`, payload)
      successMessage.value = 'Service updated.'
    } else {
      await api.post('/services', payload)
      successMessage.value = 'Service created.'
    }
    showForm.value = false
    await load()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'The service could not be saved.')
  } finally {
    isSaving.value = false
  }
}

async function remove(service: CleaningService) {
  if (!window.confirm(`Remove "${service.name}"? Services used by quote history will be deactivated instead.`)) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.delete(`/services/${service.id}`)
    successMessage.value = 'Service removed or deactivated.'
    await load()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'The service could not be removed.')
  }
}

function formatPrice(price: CleaningService['startingPrice']) {
  return price === null ? 'Custom quote' : `From $${Number(price).toFixed(2)}`
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
        <h1 class="mt-2 text-3xl font-semibold text-slate-900">Service management</h1>
        <p class="mt-2 text-slate-600">Changes here are reflected in the public service list and quote form.</p>
      </div>
      <button type="button" class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark" @click="openCreate">
        <Plus class="h-4 w-4" /> Create service
      </button>
    </header>

    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
    <p v-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading services…</p>
    <div v-else-if="services.length" class="grid gap-4 xl:grid-cols-2">
      <article v-for="service in services" :key="service.id" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold text-slate-900">{{ service.name }}</h2>
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="service.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'">{{ service.isActive ? 'Active' : 'Inactive' }}</span>
            </div>
            <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{{ service.category }}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary" @click="openEdit(service)">Edit</button>
            <button type="button" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="remove(service)">Remove</button>
          </div>
        </div>
        <p class="mt-4 text-sm leading-6 text-slate-600">{{ service.description }}</p>
        <div class="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <span>{{ formatPrice(service.startingPrice) }}</span>
          <span>{{ service.estimatedDurationMinutes }} min estimate</span>
        </div>
      </article>
    </div>
    <p v-else class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No services are in the catalog.</p>

    <div v-if="showForm" class="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation" @click.self="showForm = false">
      <section role="dialog" aria-modal="true" aria-labelledby="service-form-title" class="my-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div class="flex items-center justify-between">
          <h2 id="service-form-title" class="text-2xl font-semibold text-slate-900">{{ editing ? 'Edit service' : 'Create service' }}</h2>
          <button type="button" aria-label="Close dialog" class="rounded-full p-2 text-slate-500 hover:bg-slate-100" @click="showForm = false"><X class="h-5 w-5" /></button>
        </div>
        <form class="mt-6 grid gap-4 sm:grid-cols-2" @submit.prevent="save">
          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Name
            <input v-model="form.name" maxlength="150" required minlength="2" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Description
            <textarea v-model="form.description" maxlength="5000" required minlength="10" rows="4" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700">Category
            <select v-model="form.category" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
              <option value="RESIDENTIAL">Residential</option><option value="COMMERCIAL">Commercial</option><option value="SPECIALTY">Specialty</option>
            </select>
          </label>
          <label class="text-sm font-medium text-slate-700">Starting price
            <input v-model="form.startingPrice" type="number" min="0" step="0.01" placeholder="Custom quote" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
            <span class="mt-1 block text-xs font-normal text-slate-500">{{ editing ? 'Leave blank to keep the current price; the backend does not support clearing it.' : 'Leave blank for a custom quote.' }}</span>
          </label>
          <label class="text-sm font-medium text-slate-700">Estimated duration (minutes)
            <input v-model="form.estimatedDurationMinutes" type="number" min="1" step="1" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700">Image URL <span class="font-normal text-slate-500">(optional)</span>
            <input v-model="form.imageUrl" type="url" maxlength="2048" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="flex items-center gap-3 text-sm font-medium text-slate-700 sm:col-span-2">
            <input v-model="form.isActive" type="checkbox" class="h-4 w-4 accent-sky-600" /> Show this service on the public website
          </label>
          <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2" role="alert">{{ errorMessage }}</p>
          <div class="flex justify-end gap-3 sm:col-span-2">
            <button type="button" class="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700" @click="showForm = false">Cancel</button>
            <button type="submit" :disabled="isSaving" class="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{{ isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create service' }}</button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>
