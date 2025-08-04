<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card id="customer-details-export" class="customer-details-modal" style="min-width: 500px; max-width: 650px;">
      <!-- Modal Header -->
      <q-card-section class="bg-primary text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6 flex items-center">
              <q-icon name="person" size="sm" class="q-mr-sm" />
              {{ t('customer.customerDetails') }}
            </div>
            <div class="text-caption opacity-80">
              {{ t('customer.viewCustomerInformation') }}
            </div>
          </div>
          <div class="col-auto">
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </div>
      </q-card-section>

      <!-- Modal Content -->
      <q-card-section v-if="customer" class="q-pa-lg">
        <!-- Customer Info Cards -->
        <div class="row q-col-gutter-md">
          <!-- Basic Info Card -->
          <div class="col-12">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="info" size="sm" class="q-mr-sm" />
                  {{ t('customer.basicInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Customer ID -->
                  <div class="col-6">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.id') }}</div>
                      <q-badge color="blue-6" outline class="detail-badge">
                        <q-icon name="tag" size="xs" class="q-mr-xs" />
                        #{{ customer.id }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Customer Type -->
                  <div class="col-6">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.type') }}</div>
                      <q-badge :color="customer.type === 'customer' ? 'green-6' : 'orange-6'" class="detail-badge">
                        <q-icon :name="customer.type === 'customer' ? 'person' : 'business'" size="xs"
                          class="q-mr-xs" />
                        {{ customer.type === 'customer' ? t('customer.customer') : t('customer.supplier') }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Full Name -->
                  <div class="col-12">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.name') }}</div>
                      <q-badge color="indigo-6" outline class="detail-badge full-width">
                        <q-icon name="person_outline" size="xs" class="q-mr-xs" />
                        {{ customer.fname }} {{ customer.sname }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Phone Number -->
                  <div class="col-12">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.phone') }}</div>
                      <q-badge color="purple-6" outline class="detail-badge full-width">
                        <q-icon name="phone" size="xs" class="q-mr-xs" />
                        {{ customer.fphone }}
                      </q-badge>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Location Info Card -->
          <div class="col-12" v-if="customer.place || customer.location">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="location_on" size="sm" class="q-mr-sm" />
                  {{ t('customer.locationInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Place -->
                  <div class="col-6" v-if="customer.place">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.place') }}</div>
                      <q-badge color="teal-6" outline class="detail-badge">
                        <q-icon name="home" size="xs" class="q-mr-xs" />
                        {{ customer.place }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Location -->
                  <div class="col-6" v-if="customer.location">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.location') }}</div>
                      <q-badge color="cyan-6" outline class="detail-badge">
                        <q-icon name="map" size="xs" class="q-mr-xs" />
                        {{ customer.location?.name || 'N/A' }}
                      </q-badge>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Credit Information Card -->
          <div class="col-12" v-if="(customer.type === 'supplier' && customer.sell_borrow !== undefined) ||
            (customer.type === 'customer' && customer.purchase_borrow !== undefined)">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm" />
                  {{ t('customer.creditInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <!-- Supplier Credit (Our debt to supplier) -->
                <div class="detail-item" v-if="customer.type === 'supplier' && customer.sell_borrow !== undefined">
                  <div class="detail-label">{{ t('customer.columns.sellBorrow') }}</div>
                  <div class="credit-card we-owe">
                    <div class="credit-info">
                      <div class="credit-label">{{ t('customer.weOwe') }}</div>
                      <div class="credit-value">{{ formatCurrency(customer.sell_borrow) }}</div>
                    </div>
                    <div class="credit-icon">
                      <q-icon name="payments" size="md" />
                    </div>
                  </div>
                  <div class="credit-description">
                    {{ t('customer.ourDebtToSupplier') }}
                  </div>
                </div>

                <!-- Customer Credit (Customer's debt to us) -->
                <div class="detail-item" v-if="customer.type === 'customer' && customer.purchase_borrow !== undefined">
                  <div class="detail-label">{{ t('customer.columns.purchaseBorrow') }}</div>
                  <div class="credit-card they-owe">
                    <div class="credit-info">
                      <div class="credit-label">{{ t('customer.theyOwe') }}</div>
                      <div class="credit-value">{{ formatCurrency(customer.purchase_borrow) }}</div>
                    </div>
                    <div class="credit-icon">
                      <q-icon name="account_balance" size="md" />
                    </div>
                  </div>
                  <div class="credit-description">
                    {{ t('customer.customerDebtToUs') }}
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Additional Info Card -->
          <div class="col-12" v-if="customer.created_at">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="schedule" size="sm" class="q-mr-sm" />
                  {{ t('customer.additionalInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="detail-item">
                  <div class="detail-label">{{ t('customer.columns.createdAt') }}</div>
                  <q-badge color="grey-6" outline class="detail-badge full-width">
                    <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
                    {{ formatDate(customer.created_at) }}
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- No Customer Data -->
      <q-card-section v-else class="text-center q-pa-xl">
        <q-icon name="warning" size="lg" color="warning" class="q-mb-md" />
        <div class="text-h6 text-grey-7">{{ t('customer.noCustomerData') }}</div>
        <div class="text-caption text-grey-5">{{ t('customer.customerNotFound') }}</div>
      </q-card-section>

      <!-- Modal Actions -->
      <q-card-actions align="right" class="q-pa-lg">
        <q-btn flat :label="t('common.close')" color="grey-7" v-close-popup icon="close" />
        <q-btn :label="isExporting ? t('customer.exporting') : t('customer.exportAsImage')" color="primary"
          :icon="isExporting ? '' : 'image'" @click="exportCustomerDetails" :loading="isExporting"
          :disable="!customer || isExporting" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { date, Notify } from 'quasar'
import type { Customer } from 'src/types/customer'

interface Props {
  modelValue: boolean
  customer?: Customer | null
}

const props = withDefaults(defineProps<Props>(), {
  customer: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const isExporting = ref(false)

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Format date for display
const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'dddd, MMMM D, YYYY • h:mm A')
}

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === 0) return '$0.00'

  const absValue = Math.abs(value)

  // Format with thousand separators and 2 decimal places
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Using USD as default, change as needed
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absValue)

  // Add + or - sign based on value
  return value < 0 ? `-${formatted}` : formatted
}

// Export customer details as image
const exportCustomerDetails = async () => {
  if (!props.customer || isExporting.value) return

  try {
    isExporting.value = true

    // Wait for DOM to be ready
    await nextTick()

    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default

    // Find the modal content to capture
    const modalContent = document.querySelector('#customer-details-export') as HTMLElement

    if (!modalContent) {
      throw new Error('Modal content not found')
    }

    // Create canvas from the modal content
    const canvas = await html2canvas(modalContent, {
      useCORS: true,
      allowTaint: true,
      logging: false
    } as any)

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob')
      }

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      // Generate filename
      const customer = props.customer!
      const filename = `customer_details_${customer.id}_${customer.fname}_${customer.sname}_${date.formatDate(new Date(), 'YYYY-MM-DD')}.png`

      link.href = url
      link.download = filename
      link.style.display = 'none'

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      URL.revokeObjectURL(url)

      // Show success message
      Notify.create({
        type: 'positive',
        message: t('customer.exportSuccess'),
        position: 'top-right',
        timeout: 3000
      })
    }, 'image/png', 0.95)

  } catch (error) {
    console.error('Export failed:', error)
    Notify.create({
      type: 'negative',
      message: t('customer.exportFailed'),
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.customer-details-modal {
  border-radius: 12px;
  overflow: hidden;
}

.info-card {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(var(--q-primary-rgb), 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.detail-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.detail-badge {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;

  &.full-width {
    width: 100%;
    justify-content: flex-start;
  }
}

// Credit card styles
.credit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 8px;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &.we-owe {
    background: linear-gradient(135deg, #ff6b6b, #ee5253);
  }

  &.they-owe {
    background: linear-gradient(135deg, #1e88e5, #0d47a1);
  }

  .credit-info {
    display: flex;
    flex-direction: column;
  }

  .credit-label {
    font-size: 0.85rem;
    opacity: 0.9;
    margin-bottom: 4px;
  }

  .credit-value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .credit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }
}

.credit-description {
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
  font-style: italic;
  padding-left: 4px;
}

// Responsive adjustments
@media (max-width: 600px) {
  .customer-details-modal {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .detail-badge {
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

// Animation for modal content
.q-card-section {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Export-friendly styles
#customer-details-export {

  // Ensure good contrast for image export
  .detail-badge {
    border-width: 2px !important;

    &.full-width {
      border: 2px solid rgba(0, 0, 0, 0.1) !important;
    }
  }

  .info-card {
    border-width: 2px !important;
    border-color: rgba(0, 0, 0, 0.1) !important;
  }

  .text-primary {
    color: #1976d2 !important;
  }

  // Ensure credit cards look good in exports
  .credit-card {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;

    &.we-owe {
      background: linear-gradient(135deg, #ff6b6b, #ee5253) !important;
    }

    &.they-owe {
      background: linear-gradient(135deg, #1e88e5, #0d47a1) !important;
    }

    .credit-icon {
      background: rgba(255, 255, 255, 0.25) !important;
    }

    .credit-value {
      font-weight: 700 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }
  }

  .credit-description {
    color: #555 !important;
    font-weight: 500 !important;
  }
}
</style>
