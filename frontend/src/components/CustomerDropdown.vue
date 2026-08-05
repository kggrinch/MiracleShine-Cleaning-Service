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
  <div class="card bg-dark text-white border-0 shadow-sm">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <p class="text-uppercase small text-info mb-1">Backend preview</p>
          <h3 class="h5 fw-semibold">Customer directory</h3>
        </div>
        <span v-if="loading" class="badge bg-secondary text-white">Loading…</span>
      </div>

      <label class="form-label text-white-50" for="customer-select">Select a customer</label>
      <select
        id="customer-select"
        v-model="selected"
        class="form-select bg-dark text-white border-secondary"
      >
        <option value="" disabled>Choose a customer</option>
        <option v-for="customer in customers" :key="customer.user_id" :value="String(customer.user_id)">
          {{ customer.first_name }} {{ customer.last_name }} — {{ customer.email }}
        </option>
      </select>

      <p v-if="error" class="mt-4 text-warning small">{{ error }}</p>
      <p v-else-if="selected" class="mt-4 small text-white-50">
        Selected customer ID: <span class="fw-semibold text-white">{{ selected }}</span>
      </p>
    </div>
  </div>
</template>
