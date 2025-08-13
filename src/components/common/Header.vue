<template>
  <div class="page-header" :class="{ 'no-wave': !showWaves }">
    <div class="header-content">
      <div class="header-left">
        <h1 class="header-title">{{ title }} <span v-if="titleSecondary" class="">{{ titleSecondary }}</span></h1>
        <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-illustration" v-if="icon">
        <div v-if="showWaves" class="animated-waves"></div>
        <div class="header-icon">
          <q-icon :name="icon" :size="iconSize" :color="iconColor" />
        </div>
      </div>
      <div class="header-right" v-if="$slots.right">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps({
  title: { type: String, required: true },
  titleSecondary: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconSize: { type: String, default: '3rem' },
  iconColor: { type: String, default: 'white' },
  showWaves: { type: Boolean, default: false },
  backgroundColor: { type: String, default: '' }
});
</script>

<style lang="scss" scoped>
.page-header {
  position: relative;
  overflow: hidden;
  margin-bottom: 1.25rem;
  min-height: 140px;
  border-radius: 12px;
  background: #0ea5e9; /* subtle primary */
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  box-shadow: 0 6px 18px rgba(2, 132, 199, 0.15);
}

.header-content {
  position: relative;
  z-index: 2;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
}

.header-left { color: white; }

.header-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle { font-size: 1rem; opacity: 0.95; margin-top: 0.35rem; }

.header-illustration { position: relative; height: 120px; width: 120px; }

.header-icon {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.18);
  height: 68px; width: 68px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  backdrop-filter: blur(3px);
  z-index: 3;
}

/* Simplified wave (disabled by default) */
.animated-waves {
  position: absolute; inset: 0; margin: auto;
  height: 120px; width: 120px; border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.15), transparent 70%);
  filter: blur(0.5px);
}

.no-wave .animated-waves { display: none; }

/* Responsive */
@media (max-width: 1023px) {
  .page-header { min-height: 130px; }
  .header-title { font-size: 1.75rem; }
}

@media (max-width: 599px) {
  .page-header { padding: 1rem; }
  .header-content { flex-direction: column; text-align: center; padding: 0.75rem; }
  .header-left { margin-bottom: 0.75rem; }
  .header-title { font-size: 1.5rem; }
  .header-illustration { height: 100px; width: 100px; }
}
</style>
