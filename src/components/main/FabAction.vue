<template>
  <q-fab
    v-model="fabOpen"
    color="primary"
    text-color="white"
    :icon="$q.lang.rtl ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
    direction="left"
    class="fab-sticky"
  >
    <q-fab-action
      v-for="action in actions"
      :key="action.icon"


      label-position="top"
      color="secondary"
      text-color="white"
      :icon="action.icon"

      @click="handleAction(action)"
    />
  </q-fab>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

// Define the shape of each action
interface Action {
  icon: string;
  name: string;
  color?: string;
  textColor?: string;
}

// Define props with full typing
 defineProps<{
  actions: Action[];
}>();

// Emit function with typing
const emit = defineEmits<{
  (_event: 'action', _action: Action): void;
}>();

const fabOpen = ref(false);

// Handle action click
function handleAction(action: Action) {
  emit('action', action);
  fabOpen.value = false;
}
</script>

<style scoped>
.fab-sticky {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
}
</style>
