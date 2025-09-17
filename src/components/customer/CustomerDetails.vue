<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card id="customer-details-print" class="customer-details-modal" style="min-width: 500px; max-width: 650px;">
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
      <q-card-section v-if="customer" class="q-pa-lg" style="max-height: 67vh; overflow-y: scroll;overflow-x: hidden;">
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
                      <q-badge :color="(customer as any).type_value === 'customer' ? 'green-6' : 'orange-6'"
                        class="detail-badge">
                        <q-icon :name="(customer as any).type_value === 'customer' ? 'person' : 'business'" size="xs"
                          class="q-mr-xs" />
                        {{ customer.type }}
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

                  <!-- Primary Phone Number -->
                  <div class="col-6">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.primaryPhone') }}</div>
                      <q-badge color="purple-6" outline class="detail-badge">
                        <q-icon name="phone" size="xs" class="q-mr-xs" />
                        {{ customer.fphone }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Secondary Phone Number -->
                  <div class="col-6" v-if="customer.sphone">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.secondPhone') }}</div>
                      <q-badge color="purple-4" outline class="detail-badge">
                        <q-icon name="phone" size="xs" class="q-mr-xs" />
                        {{ customer.sphone }}
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
          <div class="col-12"
            v-if="(customer.type_value === 'supplier' && (customer.sell_borrow || 0) > 0) || (customer.type_value === 'customer' && (customer.purchase_borrow || 0) > 0)">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="account_balance_wallet" size="sm" class="q-mr-sm" />
                  {{ t('customer.creditInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <!-- Supplier Credit (Our debt to supplier) -->
                <div class="detail-item"
                  v-if="customer.type_value === 'supplier' && customer.sell_borrow !== undefined">
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

                  <!-- Borrow per Branch -->
                  <div
                    v-if="customer.sell_borrow_per_branch && Object.keys(customer.sell_borrow_per_branch).length"
                    class="q-mt-sm">
                    <div class="text-subtitle2 text-grey-7 q-mb-sm">
                      {{ t('customer.borrowPerBranch') }}:
                    </div>

                    <div class="row no-wrap q-gutter-sm overflow-auto">
                      <q-chip v-for="(amount, branch) in customer.sell_borrow_per_branch" :key="branch"
                        :color="getBranchColor(amount)" text-color="white" class="q-py-md q-px-sm borrow-chip" dense
                        outline square>
                        <q-icon name="store" size="xs" class="q-mr-xs" />
                        <span class="q-mt-xs">{{ branch }}: &nbsp;&nbsp; <b>{{ formatCurrency(amount) }}</b></span>
                      </q-chip>
                    </div>
                  </div>
                </div>

                <!-- Customer Credit (Customer's debt to us) -->
                <div class="detail-item"
                  v-if="customer.type_value === 'customer' && customer.purchase_borrow !== undefined">
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

                  <!-- Borrow per Branch -->
                  <div
                    v-if="customer.purchase_borrow_per_branch && Object.keys(customer.purchase_borrow_per_branch).length"
                    class="q-mt-sm">
                    <div class="text-subtitle2 text-grey-7 q-mb-sm">
                      {{ t('customer.borrowPerBranch') }}:
                    </div>

                    <div class="row no-wrap q-gutter-sm overflow-auto">
                      <q-chip v-for="(amount, branch) in customer.purchase_borrow_per_branch" :key="branch"
                        :color="getBranchColor(amount)" text-color="white" class="q-py-md q-px-sm borrow-chip" dense
                        outline square>
                        <q-icon name="store" size="xs" class="q-mr-xs" />
                        <span class="q-mt-xs">{{ branch }}: &nbsp;&nbsp; <b>{{ formatCurrency(amount) }}</b></span>
                      </q-chip>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Additional Info Card -->
          <div class="col-12" v-if="customer.created_at || customer.note || customer.hasAccount !== undefined">
            <q-card flat bordered class="info-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
                  <q-icon name="schedule" size="sm" class="q-mr-sm" />
                  {{ t('customer.additionalInformation') }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Created Date -->
                  <div class="col-6" v-if="customer.created_at">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.columns.createdAt') }}</div>
                      <q-badge color="grey-6" outline class="detail-badge">
                        <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
                        {{ formatDate(customer.created_at) }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Has Account Status -->
                  <div class="col-6" v-if="customer.hasAccount !== undefined">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.accountStatus') }}</div>
                      <q-badge :color="customer.hasAccount ? 'green-6' : 'orange-6'" class="detail-badge">
                        <!-- <q-icon :name="customer.hasAccount ? 'account_circle' : 'account_circle_off'" size="xs"
                          class="q-mr-xs" /> -->
                        {{ customer.hasAccount ? t('customer.hasAccount') : t('customer.noAccount') }}
                      </q-badge>
                    </div>
                  </div>

                  <!-- Customer Notes -->
                  <div class="col-12" v-if="customer.note">
                    <div class="detail-item">
                      <div class="detail-label">{{ t('customer.note') }}</div>
                      <div class="note-content">
                        <q-icon name="note" size="sm" class="q-mr-sm text-primary" />
                        <span>{{ customer.note }}</span>
                      </div>
                    </div>
                  </div>
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
        <q-btn :label="isPrinting ? t('customer.printing') : t('customer.printDetails')" color="primary"
          :icon="isPrinting ? '' : 'print'" @click="printCustomerDetails" :loading="isPrinting"
          :disable="!customer || isPrinting" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { date, Notify } from 'quasar'
import type { Customer } from 'src/types/customer'
import { useLocale } from 'src/composables/useLocale'
import { printTemplate } from './printTemplate'
import { formatCurrency } from 'src/composables/useFormat'

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
const isPrinting = ref(false)

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const { locale } = useLocale();

// RTL detection
const isRTL = computed(() => locale.value === 'ar' || locale.value === 'ckb');

// Format date for display
const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'dddd, MMMM D, YYYY')
}

// Print customer details
const printCustomerDetails = async () => {
  if (!props.customer || isPrinting.value) return

  try {
    isPrinting.value = true

    // Wait for DOM to be ready
    await nextTick()

    // Create a new window for printing
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      throw new Error('Could not open print window')
    }

    const customer = props.customer
    if (!customer) return
    const currentDate = date.formatDate(new Date(), 'MMMM D, YYYY')

    // Generate print HTML content
    const printHTML = printTemplate({ customer, isRTL, t, currentDate, formatDate, formatCurrency });

    // Instead of document.write(), use DOM methods:
    printWindow.document.body.innerHTML = printHTML;
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }

    // Show success message
    Notify.create({
      type: 'positive',
      message: t('customer.printSuccess'),
      position: 'top-right',
      timeout: 3000
    })

  } catch (error) {
    console.error('Print failed:', error)
    Notify.create({
      type: 'negative',
      message: t('customer.printFailed'),
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    isPrinting.value = false
  }
}

const getBranchColor = (amount) => {
  if (amount > 2000) return 'red-8';
  if (amount > 1750) return 'red-7';
  if (amount > 1500) return 'red-6';
  if (amount > 1250) return 'red-5';
  if (amount > 1000) return 'red-4';
  if (amount > 750) return 'orange-6';
  if (amount > 500) return 'orange-5';
  if (amount > 250) return 'orange-4';
  return 'grey';
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

.note-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #1976d2;
  font-style: italic;
  color: #555;
  display: flex;
  align-items: flex-start;
}

.borrow-chip {
  background: linear-gradient(135deg, #42a4f522, #1e88e512) !important;
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
</style>