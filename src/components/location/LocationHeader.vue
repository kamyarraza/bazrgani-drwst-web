<template>
  <q-card class="location-header-card q-mb-md">
    <q-card-section class="header-content">
      <div class="row items-center no-wrap">
        <!-- Icon and Title -->
        <div class="col-auto">
          <q-icon name="place" size="2.5rem" color="primary" />
        </div>

        <div class="col q-ml-md">
          <div class="text-h5 text-primary">{{ title }}</div>
          <div class="text-subtitle2 text-grey-7">{{ subtitle }}</div>
        </div>

        <!-- Action Button (optional) -->
        <div class="col-auto" v-if="!!actionLabel">
          <q-btn
            :label="actionLabel"
            color="primary"
            unelevated
            @click="$emit('action-click')"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Locations'
  },
  subtitle: {
    type: String,
    default: 'Manage geographical locations'
  },
  actionLabel: {
    type: String,
    default: ''
  }
});

defineEmits(['action-click']);
</script>

<style lang="scss" scoped>
.location-header-card {
  background: linear-gradient(135deg, rgba(240, 240, 255, 0.9) 0%, rgba(220, 230, 255, 0.9) 100%);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(circle at 10% 20%, rgba(100, 150, 255, 0.05) 0%, transparent 60%);
    pointer-events: none;
  }
}

.header-content {
  position: relative;
  z-index: 1;
}
</style>
