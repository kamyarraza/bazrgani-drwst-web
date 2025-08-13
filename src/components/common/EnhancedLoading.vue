<template>
  <div class="enhanced-loading" :class="{ 'table-loading': tableMode, 'overlay-loading': overlay }">
    <div class="loading-content">
      <q-spinner-gears :color="spinnerColor" :size="spinnerSize" />
      <h6 class="loading-title">{{ displayTitle }}</h6>
      <p class="loading-subtitle" v-if="subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  title?: string;
  subtitle?: string;
  spinnerColor?: string;
  spinnerSize?: string;
  tableMode?: boolean;
  overlay?: boolean;
  showDots?: boolean;
  minHeight?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  spinnerColor: 'primary',
  spinnerSize: '3rem',
  tableMode: false,
  overlay: false,
  showDots: false,
  minHeight: '240px'
});

const displayTitle = computed(() => props.title || t('common.loading', 'Loading...'));
const loadingStyle = computed(() => ({ minHeight: props.tableMode ? '180px' : props.minHeight }));
</script>

<style lang="scss" scoped>
.enhanced-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  min-height: v-bind('loadingStyle.minHeight');
}

.loading-content { text-align: center; padding: 24px; }
.loading-title { margin: 8px 0 0; color: #475569; font-weight: 600; font-size: 16px; }
.loading-subtitle { margin: 4px 0 0; color: #64748b; font-size: 13px; }

.table-loading { border: none; border-radius: 0; background: #fff; min-height: 180px; }
.overlay-loading { position: absolute; inset: 0; background: rgba(255,255,255,0.95); border: none; border-radius: 0; z-index: 1000; }
</style>
