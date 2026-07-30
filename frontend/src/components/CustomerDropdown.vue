<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/services/api.ts'

type Customer = {
  user_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string | null
}

const customers = ref<Customer[]>([])
const selected = ref('')
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get<Customer[]>('/customer')
    customers.value = response.data
    const firstCustomer = response.data[0]
    if (firstCustomer) {
      selected.value = String(firstCustomer.user_id)
    }
  } catch (err) {
    error.value = 'Unable to reach the backend customer API yet.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Backend preview</p>
        <h3 class="text-xl font-semibold">Customer directory</h3>
      </div>
      <span v-if="loading" class="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300">Loading…</span>
    </div>

    <label class="mb-2 block text-sm font-medium text-slate-300" for="customer-select">Select a customer</label>
    <select
      id="customer-select"
      v-model="selected"
      class="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none ring-0"
    >
      <option value="" disabled>Choose a customer</option>
      <option v-for="customer in customers" :key="customer.user_id" :value="String(customer.user_id)">
        {{ customer.first_name }} {{ customer.last_name }} — {{ customer.email }}
      </option>
    </select>

    <p v-if="error" class="mt-4 text-sm text-amber-300">{{ error }}</p>
    <p v-else-if="selected" class="mt-4 text-sm text-slate-300">
      Selected customer ID: <span class="font-semibold text-white">{{ selected }}</span>
    </p>
  </div>
</template>
