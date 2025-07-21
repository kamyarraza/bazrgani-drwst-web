<template>
  <QModalForm
    v-model="isVisible"
    :title="t('transaction.refundItems')"
    :show-user-info="false"
  >
    <template #default>
      <q-form @submit.prevent="handleSubmit">
        <div class="q-pa-md">
          <!-- Transaction Info -->
          <div v-if="props.transactionData" class="transaction-info q-mb-lg">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('transaction.transactionDetails') }}</div>
            <div class="info-card">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="info-item">
                    <q-icon name="person" class="info-icon" />
                    <div>
                      <div class="info-label">{{ t('transaction.customer') }}</div>
                      <div class="info-value">{{ props.transactionData.customer?.name || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-item">
                    <q-icon name="attach_money" class="info-icon" />
                    <div>
                      <div class="info-label">{{ t('transaction.totalPrice') }}</div>
                      <div class="info-value">${{ props.transactionData.total_price.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-item">
                    <q-icon name="calendar_today" class="info-icon" />
                    <div>
                      <div class="info-label">{{ t('transaction.date') }}</div>
                      <div class="info-value">{{ formatDate(props.transactionData.created_at) }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-item">
                    <q-icon name="receipt" class="info-icon" />
                    <div>
                      <div class="info-label">{{ t('transaction.type') }}</div>
                      <div class="info-value">{{ props.transactionData.type }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form content in a two-column grid -->
          <div class="row q-col-gutter-md">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('transaction.refundDetails') }}</div>              <Qinput
                v-model.number="form.refund_price"
                :label="t('transaction.refundAmount')"
                type="number"
                min="0"
                step="0.01"
                :rules="[
                  val => !!val || t('validation.required'),
                  val => (val && Number(val) > 0) || t('transaction.amountMustBePositive'),
                  val => (val && Number(val) <= calculatedRefundAmount) || t('transaction.cannotRefundMore', { amount: calculatedRefundAmount.toFixed(2) })
                ]"
                outlined
                class="enhanced-input"
                :hint="t('transaction.calculatedAmount', { amount: calculatedRefundAmount.toFixed(2) })"
                readonly
              >
                <template #before>
                  <q-icon name="attach_money" color="primary" />
                </template>
              </Qinput>

              <Qinput
                v-model.number="form.usd_iqd_rate"
                :label="t('transaction.exchangeRate')"
                type="number"
                readonly
                outlined
                class="enhanced-input"
                :hint="t('transaction.originalTransactionRate')"
              >
                <template #before>
                  <q-icon name="currency_exchange" color="primary" />
                </template>
              </Qinput>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('transaction.refundReason') }}</div>

              <q-input
                v-model="form.reason"
                :label="t('transaction.reason')"
                type="textarea"
                rows="4"
                :rules="[
                  val => !!val || t('validation.required'),
                  val => val.length >= 10 || t('transaction.reasonMinLength')
                ]"
                outlined

              >
                <template #before>
                  <q-icon name="description" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Items to Refund Section -->
          <div class="q-mt-lg">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('transaction.itemsToRefund') }}</div>

            <div v-if="availableItems.length > 0" class="items-section">
              <div
                v-for="item in availableItems"
                :key="item.id"
                class="item-card"
              >
                <div class="item-info">
                  <div class="item-header">
                    <q-icon name="inventory_2" class="item-icon" />
                    <div>
                      <div class="item-name">{{ item.name }}</div>
                      <div class="item-details">
                        {{ t('transaction.available') }}: {{ item.quantity }} {{ t('transaction.units') }} |
                        {{ t('transaction.unitPrice') }}: ${{ item.unit_price.toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>                <div class="item-controls">
                  <Qinput
                    :model-value="refundQuantities[item.id] || 0"
                    @update:model-value="(val) => {
                      const numVal = Number(val) || 0;
                      const maxAllowed = item.quantity;
                      refundQuantities[item.id] = numVal > maxAllowed ? maxAllowed : numVal;
                      updateRefundDetails();
                    }"
                    :label="t('transaction.quantity')"
                    type="number"
                    min="0"
                    :max="item.quantity"
                    :rules="[
                      val => Number(val) >= 0 || t('transaction.quantityMustBePositive'),
                      val => Number(val) <= item.quantity || t('transaction.cannotRefundMoreThanAvailable', { available: item.quantity })
                    ]"
                    outlined
                    dense
                    style="width: 140px"
                    class="enhanced-input-small"
                    :hint="t('transaction.maxAvailable', { max: item.quantity })"
                  />
                </div>
              </div>

              <div v-if="!hasItemsToRefund" class="warning-message">
                <q-icon name="warning" /> {{ t('transaction.selectAtLeastOneItem') }}
              </div>
            </div>

            <div v-else class="no-items-message">
              <q-icon name="info" color="info" />
              {{ t('transaction.noItemsForRefund') }}
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <!-- Form Actions -->
          <div class="row justify-end q-gutter-sm">
            <Qbtn
              :btn-label="t('common.cancel')"
              color="negative"
              :is-flat="true"
              :no-caps="true"
              @click="close"
            />
            <Qbtn
              type="submit"
              :btn-label="t('transaction.processRefund')"
              color="primary"
              :is-rounded="false"
              :no-caps="true"
              :loading="loading"
              :disable="!isFormValid"
            />
          </div>
        </div>
      </q-form>
    </template>
  </QModalForm>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useItemTransactionStore } from 'src/stores/itemTransactionStore'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import type { List } from 'src/types/item_transaction'
import QModalForm from 'src/components/common/QModalForm.vue'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'

const { t } = useI18n()

// Props
interface Props {
  modelValue: boolean
  transactionData: List | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

// Store and composables
const transactionStore = useItemTransactionStore()
const $q = useQuasar()

// Reactive state
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = computed(() => transactionStore.loading)

// Form data
const form = ref({
  transaction_id: 0,
  refund_price: 0,
  usd_iqd_rate: 1500, // Default rate
  reason: '',
  details: [] as Array<{ item_id: number; quantity: number }>
})

const refundQuantities = ref<Record<number, number>>({})

// Computed properties
const availableItems = computed(() => {
  return props.transactionData?.items || []
})

const _maxRefundAmount = computed(() => {
  return props.transactionData?.total_price || 0
})

const calculatedRefundAmount = computed(() => {
  let total = 0
  Object.entries(refundQuantities.value).forEach(([itemId, quantity]) => {
    const item = availableItems.value.find(i => i.id === parseInt(itemId))
    if (item && quantity > 0) {
      total += item.unit_price * quantity
    }
  })
  return total
})

const hasItemsToRefund = computed(() => {
  return Object.values(refundQuantities.value).some(qty => qty > 0)
})

const isFormValid = computed(() => {
  return calculatedRefundAmount.value > 0 &&
         form.value.reason.length >= 10 &&
         hasItemsToRefund.value
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const updateRefundDetails = () => {
  form.value.details = Object.entries(refundQuantities.value)
    .filter(([_, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({
      item_id: parseInt(itemId),
      quantity: quantity
    }))

  // Auto-calculate refund amount based on selected items
  form.value.refund_price = calculatedRefundAmount.value
}

const close = () => {
  isVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    transaction_id: 0,
    refund_price: 0,
    usd_iqd_rate: 1500,
    reason: '',
    details: []
  }
  refundQuantities.value = {}
}

const handleSubmit = async () => {
  try {
    if (!props.transactionData) {
      throw new Error(t('transaction.noTransactionData'))
    }

    // Validate quantities don't exceed available amounts
    for (const detail of form.value.details) {
      const item = availableItems.value.find(i => i.id === detail.item_id)
      if (!item || detail.quantity > item.quantity) {
        throw new Error(t('transaction.cannotRefundQuantity', {
          quantity: detail.quantity,
          itemName: item?.name || 'item',
          available: item?.quantity || 0
        }))
      }
    }

    form.value.transaction_id = props.transactionData.id

    await transactionStore.refundTransaction(form.value)

    $q.notify({
      type: 'positive',
      message: t('transaction.refundProcessedSuccessfully'),
      position: 'top'
    })

    emit('success')
    close()
  } catch (error) {
    console.error('Error processing refund:', error)
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : t('transaction.failedToProcessRefund'),
      position: 'top'
    })
  }
}

// Initialize form when transaction data changes
watch(() => props.transactionData, (newData) => {
  if (newData) {
    form.value.transaction_id = newData.id
    // Use the original transaction's exchange rate
    form.value.usd_iqd_rate = newData.usd_iqd_rate || 1500
    // Initialize refund quantities to 0 for all items
    const quantities: Record<number, number> = {}
    newData.items?.forEach(item => {
      quantities[item.id] = 0
    })
    refundQuantities.value = quantities
  }
}, { immediate: true })

// Initialize when component mounts
onMounted(() => {
  if (props.transactionData) {
    form.value.transaction_id = props.transactionData.id
    // Use the original transaction's exchange rate
    form.value.usd_iqd_rate = props.transactionData.usd_iqd_rate || 1500
  }
})
</script>

<style lang="scss" scoped>
.transaction-info {
  .info-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid var(--q-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-icon {
        color: var(--q-primary);
        font-size: 1.2rem;
        min-width: 24px;
      }

      .info-label {
        font-weight: 500;
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 2px;
      }

      .info-value {
        font-weight: 600;
        color: #333;
        font-size: 1rem;
      }
    }
  }
}

.items-section {
  .item-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border: 2px solid #f0f4f8;
    border-radius: 12px;
    margin-bottom: 12px;
    background: #fafbfc;
    transition: all 0.2s ease;

    &:hover {
      border-color: rgba(var(--q-primary-rgb), 0.3);
      background: rgba(var(--q-primary-rgb), 0.02);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .item-info {
      flex: 1;

      .item-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .item-icon {
          color: var(--q-primary);
          font-size: 1.3rem;
        }
      }

      .item-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
        font-size: 1rem;
      }

      .item-details {
        font-size: 0.85rem;
        color: #666;
        line-height: 1.4;
      }
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

.enhanced-input-small {
  :deep(.q-field__control) {
    height: 40px;
    border-radius: 8px;
  }

  &.q-field--outlined .q-field__control:before {
    border: 2px solid rgba(0, 0, 0, 0.1);
  }

  &.q-field--outlined.q-field--focused .q-field__control:before {
    border-color: var(--q-primary);
    border-width: 2px;
  }
}

.no-items-message {
  text-align: center;
  padding: 32px 24px;
  color: #666;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;

  .q-icon {
    margin-right: 8px;
    font-size: 1.2rem;
  }
}

.warning-message {
  color: #f59e0b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

// Enhanced styling to match admin modals
:deep(.enhanced-input) {
  margin-bottom: 16px;

  .q-field__control {
    height: 52px;
    border-radius: 8px;
  }

  &.q-field--outlined .q-field__control:before {
    border: 2px solid rgba(0, 0, 0, 0.1);
  }

  &.q-field--outlined.q-field--focused .q-field__control:before {
    border-color: var(--q-primary);
    border-width: 2px;
  }
}

// Section headers styling
.text-subtitle1.text-primary {
  font-weight: 600;
  border-bottom: 2px solid rgba(var(--q-primary-rgb), 0.1);
  padding-bottom: 8px;
  margin-bottom: 16px !important;
}

// Readonly field styling
:deep(.enhanced-input .q-field--readonly) {
  .q-field__control {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
  }

  .q-field__native {
    color: #666;
  }

  .q-field__label {
    color: #666;
  }
}
</style>
