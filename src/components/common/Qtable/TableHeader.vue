<template>
  <div v-if="topRight && canViewTopRightAction" class="top-right-buttons">
    <!-- Primary Action Button -->
    <Qbutton v-if="topRightTitle" :isFlat="true" :btn-color="'primary'" :btn-label="topRightTitle" :no-caps="true"
      @click="$emit('top-right-action')" class="table-top-action">
      <q-icon v-if="topRightIcon" :name="topRightIcon" class="q-mr-xs" />
      <q-icon v-else name="add" class="q-mr-xs" />
    </Qbutton>

    <!-- Secondary Action Button -->
    <Qbutton v-if="topRightSecondaryTitle" :isFlat="true" :btn-color="'secondary'" :btn-label="topRightSecondaryTitle"
      :no-caps="true" @click="$emit('top-right-secondary-action')" class="table-top-action secondary-action">
      <q-icon v-if="topRightSecondaryIcon" :name="topRightSecondaryIcon" class="q-mr-xs" />
    </Qbutton>

    <!-- Tertiary Action Button -->
    <Qbutton v-if="topRightTertiaryTitle" :isFlat="true" :btn-color="'tertiary'" :btn-label="topRightTertiaryTitle"
      :no-caps="true" @click="$emit('top-right-tertiary-action')" class="table-top-action tertiary-action">
      <q-icon v-if="topRightTertiaryIcon" :name="topRightTertiaryIcon" class="q-mr-xs" />
    </Qbutton>
  </div>
</template>

<script setup lang="ts">
import Qbutton from '../Qbtn.vue';

interface Props {
  topRight: boolean;
  topRightTitle?: string;
  topRightIcon?: string;
  topRightSecondaryTitle?: string;
  topRightSecondaryIcon?: string;
  topRightTertiaryTitle?: string;
  topRightTertiaryIcon?: string;
  canViewTopRightAction: boolean;
}

defineProps<Props>();

defineEmits<{
  'top-right-action': [];
  'top-right-secondary-action': [];
  'top-right-tertiary-action': [];
}>();
</script>

<style scoped>
.top-right-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.table-top-action {
  transition: all 0.2s ease;
  border: 1px solid #cfcfcf;
  box-shadow: -1px 2px 6px rgba(0, 0, 0, 0.2);
}

.table-top-action:hover {
  transform: translateY(-1px);
  box-shadow: -1px 2px 12px rgba(0, 0, 0, 0.28);
  background: #45454509;
}

.secondary-action {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tertiary-action {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
</style>
