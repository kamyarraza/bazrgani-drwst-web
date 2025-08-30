<template>
  <template v-if="isAdmin">
    <AdminDashboard />
  </template>
  <template v-else-if="isEmployee">
    <EmployeeDashboard />
  </template>
  <template v-else-if="isCustomer">
    <CustomerDashboard />
  </template>
  <template v-else>
    <AdminDashboard />  <!-- Fallback for unknown user types -->
  </template>
</template>

<script setup lang="ts">
import { useMeStore } from 'src/stores/meStore';
import { computed } from 'vue';
import AdminDashboard from './adminDashboard.vue';
import EmployeeDashboard from './employeeDashboard.vue';
import CustomerDashboard from './customerDashboard.vue';

const meStore = useMeStore();

const isAdmin = computed(() => meStore.me?.type === 'admin');
const isEmployee = computed(() => meStore.me?.type === 'employee');
const isCustomer = computed(() => meStore.me?.type === 'customer');
</script>