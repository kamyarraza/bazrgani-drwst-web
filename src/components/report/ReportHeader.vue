<template>
  <q-card class="report-header-card">
    <q-card-section class="header-content">
      <div class="header-left">
        <div class="header-icon">
          <q-icon :name="icon" size="48px" color="primary" />
        </div>
        <div class="header-text">
          <h1 class="header-title">{{ title }}</h1>
          <p class="header-subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          size="lg"
          @click="$emit('refresh')"
          :loading="loading"
        >
          <q-tooltip>{{ $t('report.refresh') }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="file_download"
          color="secondary"
          size="lg"
          @click="$emit('export')"
        >
          <q-tooltip>{{ $t('report.export') }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="print"
          color="accent"
          size="lg"
          @click="$emit('print')"
        >
          <q-tooltip>{{ $t('report.print') }}</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <div class="header-gradient"></div>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
  icon: string;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

defineEmits<{
  refresh: [];
  export: [];
  print: [];
}>();
</script>

<style scoped>
.report-header-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(42, 123, 155, 0.1);
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  position: relative;
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  padding: 16px;
  background: linear-gradient(135deg, rgba(42, 123, 155, 0.1) 0%, rgba(42, 155, 143, 0.1) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2A7B9B 0%, #2A9B8F 50%, #EDDD53 100%);
}

/* RTL Support */
html[dir="rtl"] .header-left {
  flex-direction: row-reverse;
}

html[dir="rtl"] .header-content {
  flex-direction: row-reverse;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 16px;
  }

  .header-title {
    font-size: 1.875rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }
}
</style>
