<template>
  <div>
    <q-card class="bg-primary text-white q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="col-auto">
            <div class="text-h5 q-mb-xs">{{ title }}</div>
            <div class="text-subtitle2">{{ subtitle }}</div>
          </div>
          <div class="col-auto flex items-center">
            <div class="text-h5 text-weight-bold countup" style="font-size: 2rem; margin-bottom: 0; margin-right: 12px;">{{ count }}</div>
            <div class="text-caption q-mt-xs" style="margin-right: 16px;">{{ countLabel }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  count: { type: [Number, String], required: true },
  countLabel: { type: String, required: true }
})
</script>

<style scoped>
.q-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.bg-primary {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%) !important;
}
.text-h5.text-weight-bold.countup {
  font-size: 2rem !important;
  font-weight: 700;
  animation: countUp 0.5s ease-out forwards;
  margin-bottom: 0;
}
@keyframes countUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
