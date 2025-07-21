<template>
  <div class="enhanced-loading" :class="{ 'table-loading': tableMode, 'overlay-loading': overlay }">
    <div class="loading-content">
      <div class="spinner-wrapper">
        <q-spinner-gears
          :color="spinnerColor"
          :size="spinnerSize"
          class="loading-spinner"
        />
        <div class="spinner-glow"></div>
      </div>
      <h6 class="loading-title">{{ displayTitle }}</h6>
      <p class="loading-subtitle" v-if="subtitle">{{ subtitle }}</p>
      <div class="loading-dots" v-if="showDots">
        <div class="dot" v-for="i in 3" :key="i"></div>
      </div>
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
  spinnerSize: '4rem',
  tableMode: false,
  overlay: false,
  showDots: true,
  minHeight: '400px'
});

const displayTitle = computed(() => {
  return props.title || t('common.loading', 'Loading...');
});

const loadingStyle = computed(() => ({
  minHeight: props.tableMode ? '300px' : props.minHeight
}));
</script>

<style lang="scss" scoped>
.enhanced-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;
  border: 2px dashed #cbd5e1;
  transition: all 0.3s ease;
  min-height: v-bind('loadingStyle.minHeight');
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
  }

  &:hover {
    border-color: #94a3b8;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.table-loading {
    border: none;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    min-height: 300px;

    &::before {
      display: none;
    }
  }

  &.overlay-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 0;
  }
}

.loading-content {
  text-align: center;
  padding: 40px;
  position: relative;
  z-index: 2;
}

.spinner-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.loading-spinner {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
}

.spinner-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}

.loading-title {
  margin: 0 0 8px;
  color: #475569;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.loading-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  opacity: 0.8;
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0s;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// Responsive design
@media (max-width: 768px) {
  .loading-content {
    padding: 30px 20px;
  }

  .loading-title {
    font-size: 16px;
  }

  .loading-subtitle {
    font-size: 13px;
  }
}
</style>
