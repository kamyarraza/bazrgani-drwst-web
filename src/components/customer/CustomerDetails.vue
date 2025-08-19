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
                      <q-badge :color="(customer as any).type_value === 'customer' ? 'green-6' : 'orange-6'" class="detail-badge">
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
    
    // `
    //   <!DOCTYPE html>
    //   <html>
    //   <head>
    //     <title>${t('customer.print.documentTitle')} - ${customer.fname} ${customer.sname}</title>
    //     <style>
    //       * {
    //         margin: 0;
    //         padding: 0;
    //         box-sizing: border-box;
    //       }
          
    //       body {
    //         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    //         line-height: 1.6;
    //         color: #333;
    //         max-width: 800px;
    //         margin: 0 auto;
    //         padding: 20px;
    //         background: white;
    //       }
          
    //       .header {
    //         text-align: center;
    //         margin-bottom: 30px;
    //         border-bottom: 3px solid #1976d2;
    //         padding-bottom: 20px;
    //       }
          
    //       .company-name {
    //         font-size: 28px;
    //         font-weight: bold;
    //         color: #1976d2;
    //         margin-bottom: 5px;
    //       }
          
    //       .document-title {
    //         font-size: 20px;
    //         color: #666;
    //         margin-bottom: 10px;
    //       }
          
    //       .print-date {
    //         font-size: 14px;
    //         color: #888;
    //       }
          
    //       .customer-info {
    //         margin-bottom: 30px;
    //       }
          
    //       .section-title {
    //         font-size: 18px;
    //         font-weight: bold;
    //         color: #1976d2;
    //         margin-bottom: 15px;
    //         border-left: 4px solid #1976d2;
    //         padding-left: 12px;
    //       }
          
    //       .info-grid {
    //         display: grid;
    //         grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    //         gap: 15px;
    //         margin-bottom: 25px;
    //       }
          
    //       .info-item {
    //         background: #f8f9fa;
    //         padding: 15px;
    //         border-radius: 8px;
    //         border: 1px solid #e9ecef;
    //       }
          
    //       .info-label {
    //         font-size: 12px;
    //         font-weight: 600;
    //         color: #666;
    //         text-transform: uppercase;
    //         letter-spacing: 0.5px;
    //         margin-bottom: 5px;
    //       }
          
    //       .info-value {
    //         font-size: 16px;
    //         font-weight: 500;
    //         color: #333;
    //       }
          
    //       .info-value.highlight {
    //         color: #1976d2;
    //         font-weight: 600;
    //       }
          
    //       .credit-section {
    //         background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    //         padding: 20px;
    //         border-radius: 10px;
    //         margin-bottom: 25px;
    //         border: 2px solid #dee2e6;
    //       }
          
    //       .credit-card {
    //         background: ${customer.type === 'supplier' ? 'linear-gradient(135deg, #ff6b6b, #ee5253)' : 'linear-gradient(135deg, #1e88e5, #0d47a1)'};
    //         color: white;
    //         padding: 20px;
    //         border-radius: 10px;
    //         text-align: center;
    //         margin-bottom: 10px;
    //       }
          
    //       .credit-amount {
    //         font-size: 24px;
    //         font-weight: bold;
    //         margin-bottom: 5px;
    //       }
          
    //       .credit-label {
    //         font-size: 14px;
    //         opacity: 0.9;
    //       }
          
    //       .credit-description {
    //         text-align: center;
    //         font-style: italic;
    //         color: #666;
    //         font-size: 14px;
    //       }
          
    //       .footer {
    //         margin-top: 40px;
    //         text-align: center;
    //         border-top: 1px solid #dee2e6;
    //         padding-top: 20px;
    //         color: #888;
    //         font-size: 12px;
    //       }
          
    //       @media print {
    //         body {
    //           margin: 0;
    //           padding: 15px;
    //         }
            
    //         .header {
    //           margin-bottom: 20px;
    //           padding-bottom: 15px;
    //         }
            
    //         .info-grid {
    //           gap: 10px;
    //         }
            
    //         .info-item {
    //           padding: 10px;
    //         }
            
    //         .credit-section {
    //           padding: 15px;
    //         }
            
    //         .footer {
    //           margin-top: 30px;
    //           padding-top: 15px;
    //         }
    //       }
    //     </style>
    //   </head>
    //   <body dir="${isRTL.value ? 'rtl' : 'ltr'}">
    //     <div class="header">
    //       <div class="company-name">${t('customer.print.companyName')}</div>
    //       <div class="document-title">${t('customer.print.documentTitle')}</div>
    //       <div class="print-date">${t('customer.print.generatedOn')} ${currentDate}</div>
    //     </div>
        
    //     <div class="customer-info">
    //       <div class="section-title">${t('customer.print.basicInformationTitle')}</div>
    //       <div class="info-grid">
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.customerId')}</div>
    //           <div class="info-value highlight">#${customer.id}</div>
    //         </div>
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.customerType')}</div>
    //           <div class="info-value">${customer.type_value === 'customer' ? t('customer.customer') : t('customer.supplier')}</div>
    //         </div>
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.fullName')}</div>
    //           <div class="info-value">${customer.fname} ${customer.sname}</div>
    //         </div>
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.phoneNumber')}</div>
    //           <div class="info-value">${customer.fphone}</div>
    //         </div>
    //         ${customer.sphone ? `
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.secondPhone')}</div>
    //           <div class="info-value">${customer.sphone}</div>
    //         </div>
    //         ` : ''}
    //         ${customer.place ? `
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.place')}</div>
    //           <div class="info-value">${customer.place}</div>
    //         </div>
    //         ` : ''}
    //         ${customer.location?.name ? `
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.location')}</div>
    //           <div class="info-value">${customer.location.name}</div>
    //         </div>
    //         ` : ''}
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.print.createdDate')}</div>
    //           <div class="info-value">${formatDate(customer.created_at)}</div>
    //         </div>
    //         ${customer.hasAccount !== undefined ? `
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.accountStatus')}</div>
    //           <div class="info-value">${customer.hasAccount ? t('customer.hasAccount') : t('customer.noAccount')}</div>
    //         </div>
    //         ` : ''}
    //         ${customer.note ? `
    //         <div class="info-item">
    //           <div class="info-label">${t('customer.note')}</div>
    //           <div class="info-value" style="font-style: italic; background: #f8f9fa; padding: 8px; border-radius: 4px;">${customer.note}</div>
    //         </div>
    //         ` : ''}
    //       </div>
    //     </div>
        
    //     ${(customer.type === 'supplier' && customer.sell_borrow !== undefined) ||
    //     (customer.type === 'customer' && customer.purchase_borrow !== undefined) ? `
    //     <div class="credit-section">
    //       <div class="section-title">${t('customer.print.creditInformationTitle')}</div>
    //       ${customer.type === 'supplier' && customer.sell_borrow !== undefined ? `
    //       <div class="credit-card">
    //         <div class="credit-amount">${formatCurrency(customer.sell_borrow)}</div>
    //         <div class="credit-label">${t('customer.print.weOweSupplier')}</div>
    //       </div>
    //       <div class="credit-description">
    //         ${t('customer.print.supplierDebtDescription')}
    //       </div>
    //       ` : ''}
    //       ${customer.type === 'customer' && customer.purchase_borrow !== undefined ? `
    //       <div class="credit-card">
    //         <div class="credit-amount">${formatCurrency(customer.purchase_borrow)}</div>
    //         <div class="credit-label">${t('customer.print.customerOwesUs')}</div>
    //       </div>
    //       <div class="credit-description">
    //         ${t('customer.print.customerDebtDescription')}
    //       </div>
    //       ` : ''}
    //     </div>
    //     ` : ''}
        
    //     <div class="footer">
    //       <p>${t('customer.print.footerNote')}</p>
    //       <p>${t('customer.print.contactNote')}</p>
    //     </div>
    //   </body>
    //   </html>
    // `

    // Write content to print window
    printWindow.document.write(printHTML)
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
