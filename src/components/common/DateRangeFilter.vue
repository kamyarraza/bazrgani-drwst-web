<template>
  <q-card flat bordered class="date-range-filter">
    <q-card-section class="q-pa-md">
      <div class="row q-col-gutter-md items-end">
        <!-- From Date -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="fromDate"
            outlined
            readonly
            :label="t('common.fromDate')"
            class="date-input"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer" />
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="fromDate"
                  mask="YYYY-MM-DD"
                  @update:model-value="onFromDateChange"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
              <q-btn
                v-if="fromDate"
                flat
                round
                dense
                icon="clear"
                @click="clearFromDate"
                size="sm"
                class="q-ml-xs"
              >
                <q-tooltip>{{ t('common.clear') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <!-- To Date -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="toDate"
            outlined
            readonly
            :label="t('common.toDate')"
            class="date-input"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer" />
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="toDate"
                  mask="YYYY-MM-DD"
                  :options="toDateOptions"
                  @update:model-value="onToDateChange"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
              <q-btn
                v-if="toDate"
                flat
                round
                dense
                icon="clear"
                @click="clearToDate"
                size="sm"
                class="q-ml-xs"
              >
                <q-tooltip>{{ t('common.clear') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </div>

        <!-- Quick Select Buttons -->
        <div class="col-12 col-md-4">
          <div class="quick-select-buttons">
            <q-btn-group flat>
              <q-btn
                flat
                :label="t('common.today')"
                size="sm"
                @click="selectToday"
                :color="isToday ? 'primary' : 'grey-8'"
                :class="{ 'text-weight-bold': isToday }"
              />
              <q-btn
                flat
                :label="t('common.thisWeek')"
                size="sm"
                @click="selectThisWeek"
                :color="isThisWeek ? 'primary' : 'grey-8'"
                :class="{ 'text-weight-bold': isThisWeek }"
              />
              <q-btn
                flat
                :label="t('common.thisMonth')"
                size="sm"
                @click="selectThisMonth"
                :color="isThisMonth ? 'primary' : 'grey-8'"
                :class="{ 'text-weight-bold': isThisMonth }"
              />
            </q-btn-group>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-auto">
          <q-btn
            :label="t('common.applyFilter')"
            color="primary"
            icon="filter_list"
            @click="applyFilter"
            :disable="!canApplyFilter"
            no-caps
          />
        </div>
        <div class="col-auto">
          <q-btn
            :label="t('common.clearFilter')"
            flat
            color="grey-8"
            icon="clear"
            @click="clearFilter"
            :disable="!hasActiveFilter"
            no-caps
          />
        </div>
        <div class="col-auto" v-if="hasActiveFilter">
          <q-chip
            removable
            @remove="clearFilter"
            color="primary"
            text-color="white"
            icon="date_range"
            size="sm"
          >
            {{ formatDateRange }}
          </q-chip>
        </div>
      </div>

      <!-- Date Range Summary -->
      <div v-if="fromDate || toDate" class="q-mt-sm">
        <div class="text-caption text-grey-6">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          {{ dateRangeSummary }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  modelValue?: {
    fromDate?: string | undefined;
    toDate?: string | undefined;
  };
  autoApply?: boolean;
  showQuickSelect?: boolean;
}

interface Emits {
  (_e: 'update:modelValue', _value: { fromDate?: string | undefined; toDate?: string | undefined }): void;
  (_e: 'filter-applied', _value: { fromDate?: string | undefined; toDate?: string | undefined }): void;
  (_e: 'filter-cleared'): void;
}

const props = withDefaults(defineProps<Props>(), {
  autoApply: false,
  showQuickSelect: true
});

const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();

// State
const fromDate = ref<string>('');
const toDate = ref<string>('');

// Initialize from props
if (props.modelValue) {
  fromDate.value = props.modelValue.fromDate || '';
  toDate.value = props.modelValue.toDate || '';
}

// Computed
const getCurrentDate = (): string => {
  const dateStr = new Date().toISOString().split('T')[0];
  return dateStr || '';
};

const toDateOptions = () => {
  // Allow all dates - no restrictions
  return true;
};

const canApplyFilter = computed(() => {
  return fromDate.value || toDate.value;
});

const hasActiveFilter = computed(() => {
  return props.modelValue?.fromDate || props.modelValue?.toDate;
});

const formatDateRange = computed(() => {
  if (props.modelValue?.fromDate && props.modelValue?.toDate) {
    return `${formatDate(props.modelValue.fromDate)} - ${formatDate(props.modelValue.toDate)}`;
  } else if (props.modelValue?.fromDate) {
    return `${t('common.from')} ${formatDate(props.modelValue.fromDate)}`;
  } else if (props.modelValue?.toDate) {
    return `${t('common.to')} ${formatDate(props.modelValue.toDate)}`;
  }
  return '';
});

const dateRangeSummary = computed(() => {
  if (fromDate.value && toDate.value) {
    const days = calculateDaysBetween(fromDate.value, toDate.value);
    return t('common.dateRangeSummary', `Selected range: ${days} days`);
  } else if (fromDate.value) {
    return t('common.fromDateSelected', `From: ${formatDate(fromDate.value)}`);
  } else if (toDate.value) {
    return t('common.toDateSelected', `To: ${formatDate(toDate.value)}`);
  }
  return '';
});

// Quick select computed
const isToday = computed(() => {
  const today = getCurrentDate();
  return fromDate.value === today && toDate.value === today;
});

const isThisWeek = computed(() => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  return fromDate.value === startOfWeek.toISOString().split('T')[0] &&
         toDate.value === endOfWeek.toISOString().split('T')[0];
});

const isThisMonth = computed(() => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return fromDate.value === startOfMonth.toISOString().split('T')[0] &&
         toDate.value === endOfMonth.toISOString().split('T')[0];
});

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const calculateDaysBetween = (from: string, to: string) => {
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  return Math.ceil((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1;
};

const onFromDateChange = () => {
  // If to date is before from date, clear to date
  if (toDate.value && fromDate.value && toDate.value < fromDate.value) {
    toDate.value = '';
  }

  if (props.autoApply) {
    applyFilter();
  }
};

const onToDateChange = () => {
  if (props.autoApply) {
    applyFilter();
  }
};

const clearFromDate = () => {
  fromDate.value = '';
  if (props.autoApply) {
    applyFilter();
  }
};

const clearToDate = () => {
  toDate.value = '';
  if (props.autoApply) {
    applyFilter();
  }
};

const applyFilter = () => {
  const filterValue: { fromDate?: string | undefined; toDate?: string | undefined } = {
    fromDate: fromDate.value || undefined,
    toDate: toDate.value || undefined
  };

  emit('update:modelValue', filterValue);
  emit('filter-applied', filterValue);
};

const clearFilter = () => {
  fromDate.value = '';
  toDate.value = '';

  const emptyFilter: { fromDate?: string | undefined; toDate?: string | undefined } = {
    fromDate: undefined,
    toDate: undefined
  };
  emit('update:modelValue', emptyFilter);
  emit('filter-cleared');
  emit('filter-applied', emptyFilter); // Also emit filter-applied to trigger backend fetch
};

// Quick select methods
const selectToday = () => {
  const today = getCurrentDate();
  fromDate.value = today;
  toDate.value = today;

  if (props.autoApply) {
    applyFilter();
  }
};

const selectThisWeek = () => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

  fromDate.value = startOfWeek.toISOString().split('T')[0] || '';
  toDate.value = endOfWeek.toISOString().split('T')[0] || '';

  if (props.autoApply) {
    applyFilter();
  }
};

const selectThisMonth = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  fromDate.value = startOfMonth.toISOString().split('T')[0] || '';
  toDate.value = endOfMonth.toISOString().split('T')[0] || '';

  if (props.autoApply) {
    applyFilter();
  }
};

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fromDate.value = newValue.fromDate || '';
    toDate.value = newValue.toDate || '';
  } else {
    fromDate.value = '';
    toDate.value = '';
  }
}, { deep: true });
</script>

<style scoped>
.date-range-filter {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.date-input {
  .q-field__control {
    border-radius: 8px;
  }
}

.quick-select-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.quick-select-buttons .q-btn {
  border-radius: 6px;
  font-size: 0.75rem;
  padding: 4px 8px;
  min-height: 32px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .quick-select-buttons {
    width: 100%;
    justify-content: center;
  }

  .quick-select-buttons .q-btn-group {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .quick-select-buttons .q-btn {
    width: 100%;
    margin-bottom: 4px;
  }
}

/* Enhanced styling */
.date-range-filter:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.text-weight-bold {
  font-weight: 600 !important;
}
</style>
