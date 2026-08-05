<script setup lang="ts">
const services = [
  {
    title: 'Office & Commercial Cleaning',
    body: 'Flexible cleaning programs for reception areas, meeting rooms, and shared workspaces.',
  },
  {
    title: 'Move-In / Move-Out Reset',
    body: 'Detailed turnover cleaning that helps landlords and tenants leave a polished space behind.',
  },
  {
    title: 'Janitorial Care',
    body: 'Reliable restroom, floor care, and breakroom attention for long-term upkeep.',
  },
  {
    title: 'Disinfection & Sanitizing',
    body: 'Extra attention to high-touch points for a healthier environment.',
  },
]
</script>

<template>
  <section class="row g-4">
    <div class="col-12">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <p class="text-primary text-uppercase small mb-2">Our services</p>
          <h1 class="h2 fw-semibold">Custom cleaning plans for every kind of property</h1>
          <p class="lead text-secondary mt-3">
            From daily office refreshes to large-scale property care, we tailor each visit around your schedule and standards.
          </p>
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="row row-cols-1 row-cols-md-2 g-4">
        <div v-for="service in services" :key="service.title" class="col">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <h2 class="h5 fw-semibold text-dark">{{ service.title }}</h2>
              <p class="text-secondary mt-3">{{ service.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
