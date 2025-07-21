<template>
  <div class="transaction-stepper">
    <q-stepper
      v-model="currentStepModel"
      ref="stepper"
      color="primary"
      animated
      flat
      keep-alive
      :vertical="$q.screen.lt.md"
      class="custom-stepper"
    >
      <!-- Step 1: Basic Information -->
      <q-step
        :name="1"
        :title="t('transaction.steps.basicInfo')"
        icon="info"
        :done="completedSteps.includes(1)"
        :error="hasStepError(1)"
        class="step-header"
      >
        <div class="step-description">
          {{ transactionType === 'sell' ? t('transaction.steps.basicInfoSellDesc') : t('transaction.steps.basicInfoPurchaseDesc') }}
        </div>
      </q-step>

      <!-- Step 2: Item Selection -->
      <q-step
        :name="2"
        :title="t('transaction.steps.itemSelection')"
        icon="inventory_2"
        :done="completedSteps.includes(2)"
        :error="hasStepError(2)"
        class="step-header"
      >
        <div class="step-description">
          {{ t('transaction.steps.itemSelectionDesc') }}
        </div>
      </q-step>

      <!-- Step 3: Details & Pricing -->
      <q-step
        :name="3"
        :title="t('transaction.steps.details')"
        icon="edit"
        :done="completedSteps.includes(3)"
        :error="hasStepError(3)"
        class="step-header"
      >
        <div class="step-description">
          {{ t('transaction.steps.detailsDesc') }}
        </div>
      </q-step>

      <!-- Step 4: Summary & Review -->
      <q-step
        :name="4"
        :title="t('transaction.steps.summary')"
        icon="summarize"
        :done="completedSteps.includes(4)"
        :error="hasStepError(4)"
        class="step-header"
      >
        <div class="step-description">
          {{ t('transaction.steps.summaryDesc') }}
        </div>
      </q-step>
    </q-stepper>

    <!-- Progress Indicator -->
    <div class="progress-indicator q-mt-md">
      <div class="progress-info">
        <div class="text-subtitle2 text-grey-7">
          {{ t('transaction.progress') }}: {{ completedSteps.length }}/{{ totalSteps }}
        </div>
        <div class="text-caption text-grey-5">
          {{ progressText }}
        </div>
      </div>
      <q-linear-progress
        :value="progressPercentage"
        color="primary"
        size="8px"
        rounded
        class="q-mt-xs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Props & Emits
interface Props {
  currentStep: number;
  completedSteps: number[];
  transactionType: 'sell' | 'purchase';
}

interface Emits {
  (_e: 'update:current-step', _value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();

// Total steps
const totalSteps = 4;

// Current step model
const currentStepModel = computed({
  get: () => props.currentStep,
  set: (value: number) => emit('update:current-step', value)
});

// Progress percentage
const progressPercentage = computed(() => {
  return props.completedSteps.length / totalSteps;
});

// Progress text
const progressText = computed(() => {
  if (props.completedSteps.length === 0) {
    return t('transaction.getStarted');
  } else if (props.completedSteps.length === totalSteps) {
    return t('transaction.readyToCreate');
  } else {
    return t('transaction.continue');
  }
});

// Check if step has error (you can implement validation logic here)
const hasStepError = (_stepNumber: number) => {
  // For now, return false. You can implement validation logic here
  return false;
};
</script>

<style lang="scss" scoped>
.transaction-stepper {
  .custom-stepper {
    background: transparent;
    border-radius: 12px;
    padding: 0;

    :deep(.q-stepper__step-inner) {
      padding: 12px 0;
    }

    :deep(.q-stepper__dot) {
      transition: all 0.3s ease;
    }

    :deep(.q-stepper__dot--done) {
      background: $positive;
      color: white;
    }

    :deep(.q-stepper__dot--active) {
      background: $primary;
      color: white;
      transform: scale(1.1);
    }

    :deep(.q-stepper__dot--error) {
      background: $negative;
      color: white;
    }

    :deep(.q-stepper__title) {
      font-weight: 600;
      font-size: 0.95rem;
    }

    :deep(.q-stepper__line) {
      background: $grey-4;
    }

    :deep(.q-stepper__line--active) {
      background: $primary;
    }

    :deep(.q-stepper__line--done) {
      background: $positive;
    }
  }

  .step-header {
    .step-description {
      font-size: 0.875rem;
      color: $grey-6;
      margin-top: 4px;
      line-height: 1.4;
    }
  }

  .progress-indicator {
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .transaction-stepper {
    .custom-stepper {
      :deep(.q-stepper__title) {
        font-size: 0.9rem;
      }
    }

    .step-header {
      .step-description {
        font-size: 0.8rem;
      }
    }

    .progress-indicator {
      .progress-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  }
}
</style>
