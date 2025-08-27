<template>
  <template v-if="isAdmin">
    <AdminDashboard />
  </template>
  <template v-else>
    <h1>Employee</h1>
  </template>
</template>

<script setup lang="ts">
import { useMeStore } from 'src/stores/meStore';
import { computed } from 'vue';
import AdminDashboard from './adminDashboard.vue';


const meStore = useMeStore();

const isAdmin = computed(() => meStore.me?.type === 'admin');


</script>