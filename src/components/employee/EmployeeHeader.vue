<template>
  <div class="q-mb-md">
    <q-card class="bg-primary text-white">
      <q-card-section>
        <div class="row items-center">
          <div class="col-12 col-md-8">
            <div class="text-h6">{{ title }}</div>
            <div class="text-subtitle2">{{ subtitle }}</div>
          </div>
          <div class="col-12 col-md-4 text-center text-md-right">
            <q-badge outline color="white" class="q-pa-sm text-body1">
              {{ countLabel }}: {{ count }}
            </q-badge>
            <q-btn
              :color="buttonColor"
              :text-color="buttonTextColor"
              :icon="buttonIcon"
              :label="buttonLabel"
              class="q-ml-sm"
              @click="$emit('button-click')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 0
  },
  countLabel: {
    type: String,
    default: 'Total'
  },
  buttonLabel: {
    type: String,
    default: 'Add Note'
  },
  buttonIcon: {
    type: String,
    default: 'note_add'
  },
  buttonColor: {
    type: String,
    default: 'white'
  },
  buttonTextColor: {
    type: String,
    default: 'primary'
  }
})

defineEmits(['button-click'])
</script>

<style scoped>
/* You can add custom styles here */
</style>
