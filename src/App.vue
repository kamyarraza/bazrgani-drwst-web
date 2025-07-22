<script setup lang="ts">
// App.vue should be minimal and let boot files handle initialization
// No authentication logic here to prevent duplicate calls
// import { onMounted } from 'vue';
// import { useAuthStore } from './stores/authStore';
// import { api } from './boot/axios';
// onMounted(async () => {
//   const authStore = useAuthStore();
//             const { data } = await api.post('/refresh', { refresh_token: authStore.refreshToken });
//             authStore.updateTokens(data.token,data.refresh_token);
// });
</script>

<template>
  <router-view />
</template>
