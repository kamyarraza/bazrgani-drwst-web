<template>
  <q-card class="stat-card" :style="{ background: gradientBackground }">
    <q-card-section class="flex items-center justify-between">
      <div class="stat-content">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-label">{{ label }}</div>
        <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
      </div>
      <div class="stat-icon">
        <q-icon
          :name="icon"
          size="40px"
          :color="iconColor"
        />
      </div>
    </q-card-section>

    <q-card-section v-if="trend" class="trend-section">
      <div class="trend-indicator" :class="trendClass">
        <q-icon
          :name="trend.direction === 'up' ? 'trending_up' : 'trending_down'"
          size="16px"
        />
        <span class="trend-text">{{ trend.percentage }}%</span>
      </div>
      <span class="trend-label">{{ trend.label }}</span>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Trend {
  direction: 'up' | 'down';
  percentage: number;
  label: string;
}

interface Props {
  value: string | number;
  label: string;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: Trend;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
});

const gradientBackground = computed(() => {
  const colors = {
    primary: 'linear-gradient(135deg, #2A7B9B 0%, rgba(42, 123, 155, 0.8) 100%)',
    secondary: 'linear-gradient(135deg, #2A9B8F 0%, rgba(42, 155, 143, 0.8) 100%)',
    accent: 'linear-gradient(135deg, #EDDD53 0%, rgba(237, 221, 83, 0.8) 100%)',
    positive: 'linear-gradient(135deg, #57C785 0%, rgba(87, 199, 133, 0.8) 100%)',
    warning: 'linear-gradient(135deg, #F39C12 0%, rgba(243, 156, 18, 0.8) 100%)',
    negative: 'linear-gradient(135deg, #C10015 0%, rgba(193, 0, 21, 0.8) 100%)',
    info: 'linear-gradient(135deg, #3498DB 0%, rgba(52, 152, 219, 0.8) 100%)',
  };
  return colors[props.color as keyof typeof colors] || colors.primary;
});

const iconColor = computed(() => {
  return props.color === 'accent' || props.color === 'warning' ? 'grey-8' : 'white';
});

const trendClass = computed(() => {
  if (!props.trend) return '';
  return props.trend.direction === 'up' ? 'trend-up' : 'trend-down';
});
</script>

<style scoped>
.stat-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 2px;
}

.stat-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.stat-icon {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.stat-card:hover .stat-icon {
  opacity: 1;
}

.trend-section {
  padding-top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-up {
  background: rgba(87, 199, 133, 0.2);
  color: #57C785;
}

.trend-down {
  background: rgba(193, 0, 21, 0.2);
  color: #C10015;
}

.trend-text {
  font-weight: 600;
}

.trend-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}
</style>
