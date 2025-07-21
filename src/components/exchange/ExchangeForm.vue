<template>
  <QModalForm v-model="model" :title="t('exchange.title', 'Currency Exchange')">
    <template #default>
      <q-form @submit.prevent="submitForm" class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('exchange.rateDetails', 'Exchange Rate Details') }}</div>

            <Qinput
              v-model.number="form.usd_iqd_rate"
              type="number"
              step="0.01"
              :label="t('exchange.usdIqdRate', 'USD to IQD Rate')"
              :rules="[val => !!val || t('validation.required', 'This field is required')]"
              outlined
              class="enhanced-input"
            >
              <template #before>
                <q-icon name="currency_exchange" color="primary" />
              </template>
              <template #hint>
                {{ t('exchange.usdIqdRateHint', 'Exchange rate from USD to IQD') }}
              </template>
            </Qinput>

            <Qinput
              v-model.number="form.eur_usd_rate"
              type="number"
              step="0.01"
              :label="t('exchange.eurUsdRate', 'EUR to USD Rate')"
              outlined
              class="enhanced-input q-mt-md"
            >
              <template #before>
                <q-icon name="euro_symbol" color="primary" />
              </template>
              <template #hint>
                {{ t('exchange.eurUsdRateHint', 'Exchange rate from EUR to USD (optional)') }}
              </template>
            </Qinput>

            <Qinput
              v-model="form.source"
              :label="t('exchange.source', 'Source')"
              :rules="[val => !!val || t('validation.required', 'This field is required')]"
              outlined
              class="enhanced-input q-mt-md"
            >
              <template #before>
                <q-icon name="source" color="primary" />
              </template>
              <template #hint>
                {{ t('exchange.sourceHint', 'Source of the exchange rate (e.g. Central Bank)') }}
              </template>
            </Qinput>

            <Qinput
              v-model="form.note"
              type="textarea"
              :label="t('exchange.note', 'Note')"
              outlined
              class="enhanced-input q-mt-md"
              autogrow
            >
              <template #before>
                <q-icon name="note" color="primary" />
              </template>
            </Qinput>
          </div>
        </div>

        <div class="row justify-end q-mt-lg">
          <q-btn
            :label="t('common.cancel', 'Cancel')"
            color="grey-7"
            flat
            class="q-mr-sm"
            @click="closeModal"
          />
          <q-btn
            :label="t('common.save', 'Save')"
            type="submit"
            color="primary"
            :loading="loading"
          />
        </div>
      </q-form>
    </template>
  </QModalForm>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import { useExchangeRateStore } from 'src/stores/exchangeRateStore';
import type { BasicExchangeRate } from 'src/types/exchange_rate';

const { t } = useI18n();
const exchangeRateStore = useExchangeRateStore();

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'submit']);

// Reactive values
const model = ref(props.modelValue);
const loading = ref(false);
const form = ref<BasicExchangeRate>({
  usd_iqd_rate: 0,
  eur_usd_rate: 0,
  source: '',
  note: ''
});

// Fetch active exchange rate when component mounts
onMounted(async () => {
  await fetchExchangeRate();
});

// Fetch the active exchange rate and populate form
async function fetchExchangeRate() {
  loading.value = true;
  try {
    await exchangeRateStore.fetchActiveExchangeRate();
    if (exchangeRateStore.activeRate) {
      form.value = {
        usd_iqd_rate: exchangeRateStore.activeRate.usd_iqd_rate,
        eur_usd_rate: exchangeRateStore.activeRate.eur_usd_rate,
        source: exchangeRateStore.activeRate.source,
        note: exchangeRateStore.activeRate.note
      };
    }
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
  } finally {
    loading.value = false;
  }
}

// Watch for changes in the model prop
watch(() => props.modelValue, async (newVal) => {
  model.value = newVal;
  // Refetch exchange rate when modal is opened
  if (newVal) {
    await fetchExchangeRate();
  }
});

// Watch for changes in the model value
watch(() => model.value, (newVal) => {
  emit('update:modelValue', newVal);
});

// Close the modal
function closeModal() {
  model.value = false;
}

// Submit the form
async function submitForm() {
  loading.value = true;

  try {
    const success = await exchangeRateStore.createExchangeRate(form.value);
    if (success) {
      // Reset form after successful submission
      form.value = {
        usd_iqd_rate: 0,
        eur_usd_rate: 0,
        source: '',
        note: ''
      };

      // Close the modal
      model.value = false;

      // Emit submit event
      emit('submit');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.enhanced-input {
  margin-bottom: 0.5rem;

  :deep(.q-field__control) {
    border-radius: 8px;
  }

  :deep(.q-field__control:before) {
    border-color: rgba(0, 0, 0, 0.1);
  }

  :deep(.q-field--focused .q-field__control:before) {
    border-color: var(--q-primary);
  }
}
</style>
