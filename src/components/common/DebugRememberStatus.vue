<!--
  TEMPORARY DEBUG COMPONENT
  This component shows the actual remember me preference vs internal state
  Can be removed once session issues are fully resolved
-->
<template>
  <div v-if="isDevelopment" class="debug-remember-status">
    <small class="text-caption text-grey-6">
      Debug: Remember UI={{ userPreference }}, Internal={{ authStore.rememberMe }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/authStore';

const authStore = useAuthStore();

const isDevelopment = computed(() => process.env.NODE_ENV === 'development');
const userPreference = computed(() => authStore.getUserRememberPreference());
</script>

<style scoped>
.debug-remember-status {
  padding: 4px 8px;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  margin-top: 4px;
}
</style>
