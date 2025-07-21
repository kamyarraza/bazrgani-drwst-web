<template>  <q-dialog
    v-model="isVisible"
    class="item-details-dialog"
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
  >
    <q-card class="item-details-card">
      <!-- Beautiful Modal Header -->
      <div class="modal-header">
        <div class="text-h5">
          <q-icon name="inventory_2" class="q-mr-sm" />
          {{ t('item.itemDetails') }}
        </div>
        <q-btn
          icon="close"
          flat
          round
          v-close-popup
          size="sm"
        />
      </div>

      <q-card-section v-if="itemData" class="q-pa-md">
        <!-- Item Image Preview -->
        <div v-if="itemData.image" class="item-image-preview q-mb-md text-center">
          <img :src="itemData.image" alt="Item Image" style="max-width: 120px; max-height: 120px; border-radius: 8px; border: 1.5px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.07); object-fit: contain; background: #fafbfc;" />
        </div>
        <!-- Item Summary -->
        <div class="item-summary q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="inventory_2" class="summary-icon text-primary" />                <div>
                  <div class="summary-label">{{ t('item.name') }}</div>
                  <div class="summary-value">{{ itemData?.name || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="qr_code" class="summary-icon text-blue" />                <div>
                  <div class="summary-label">{{ t('item.sku') }}</div>
                  <div class="summary-value">{{ itemData?.sku || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="category" class="summary-icon text-purple" />                <div>
                  <div class="summary-label">{{ t('item.category') }}</div>
                  <div class="summary-value">{{ itemData?.category?.name || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="attach_money" class="summary-icon text-green" />                <div>
                  <div class="summary-label">{{ t('item.unitCost') }}</div>
                  <div class="summary-value text-green text-weight-bold">${{ formatCurrency(itemData?.unit_cost) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Pricing Information -->
        <div class="pricing-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="monetization_on" class="q-mr-sm" />
            {{ t('item.pricingInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-4">
              <div class="price-card">
                <q-icon name="person" class="price-icon text-primary" />
                <div class="price-label">{{ t('item.soloPrice') }}</div>                <div class="price-value text-primary">${{ formatCurrency(itemData?.solo_unit_price) }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="price-card">
                <q-icon name="groups" class="price-icon text-orange" />
                <div class="price-label">{{ t('item.bulkPrice') }}</div>
                <div class="price-value text-orange">${{ formatCurrency(itemData?.bulk_unit_price) }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="price-card">
                <q-icon name="trending_up" class="price-icon text-positive" />
                <div class="price-label">{{ t('item.profitMargin') }}</div>
                <div class="price-value text-positive">{{ formatPercentage(itemData?.profit_margin) }}%</div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />        <!-- Inventory Information -->
        <div class="package-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="inventory" class="q-mr-sm" />
            {{ t('item.inventoryInfo') }}
          </div>          <div class="row q-col-gutter-md">
            <div class="col-3">
              <div class="package-card">
                <q-icon name="view_module" class="package-icon text-indigo" />
                <div class="package-label">{{ t('item.packages') }}</div>
                <div class="package-value">{{ itemData?.packages || 0 }}</div>
                <div class="package-price">${{ formatCurrency(itemData?.package_solo_price) }}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="package-card">
                <q-icon name="view_comfy" class="package-icon text-teal" />
                <div class="package-label">{{ t('item.packets') }}</div>
                <div class="package-value">{{ itemData?.packets || 0 }}</div>
                <div class="package-price">${{ formatCurrency(itemData?.packet_solo_price) }}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="package-card">
                <q-icon name="inventory_2" class="package-icon text-orange" />
                <div class="package-label">{{ t('item.packageUnits') }}</div>
                <div class="package-value">{{ itemData?.package_units || 0 }}</div>
                <div class="package-price">{{ t('item.units') }}</div>
              </div>
            </div>
            <div class="col-3">
              <div class="package-card">
                <q-icon name="widgets" class="package-icon text-green" />
                <div class="package-label">{{ t('item.packetUnits') }}</div>
                <div class="package-value">{{ itemData?.packet_units || 0 }}</div>
                <div class="package-price">{{ t('item.units') }}</div>
              </div>
            </div>
          </div>

          <!-- Total and Pieces Row -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-4">
              <div class="package-card">
                <q-icon name="apps" class="package-icon text-purple" />
                <div class="package-label">{{ t('item.pieces') }}</div>
                <div class="package-value">{{ itemData?.pieces || 0 }}</div>
                <div class="package-price">{{ t('item.individual') }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="package-card">
                <q-icon name="summarize" class="package-icon text-positive" />
                <div class="package-label">{{ t('item.totalQuantity') }}</div>
                <div class="package-value">{{ itemData?.total_quantity || 0 }}</div>
                <div class="package-price">{{ t('item.allItems') }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="package-card">
                <q-icon name="warning" class="package-icon text-orange" />
                <div class="package-label">{{ t('item.minQuantity') }}</div>
                <div class="package-value">{{ itemData?.min_qty || 0 }}</div>
                <div class="package-price">{{ t('item.units') }}</div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Physical Properties -->
        <div class="physical-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="straighten" class="q-mr-sm" />
            {{ t('item.physicalProperties') }}
          </div>          <div class="row q-col-gutter-md">
            <div class="col-4">
              <div class="property-item">
                <q-icon name="scale" class="property-icon text-brown" />
                <div>
                  <div class="property-label">{{ t('item.weight') }}</div>
                  <div class="property-value">{{ itemData?.weight_kg || 0 }} kg</div>
                </div>
              </div>
            </div>
            <div class="col-4">
              <div class="property-item">
                <q-icon name="view_in_ar" class="property-icon text-blue-grey" />
                <div>
                  <div class="property-label">{{ t('item.volume') }}</div>
                  <div class="property-value">{{ itemData?.volume || 0 }} L</div>
                </div>
              </div>
            </div>
            <div class="col-4">
              <div class="property-item">
                <q-icon name="schedule" class="property-icon text-grey" />
                <div>
                  <div class="property-label">{{ t('item.createdAt') }}</div>
                  <div class="property-value">{{ itemData?.created_at ? formatDate(itemData.created_at) : t('common.notSet') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>        <!-- Description -->
        <div v-if="itemData?.description" class="description-section q-mt-md">
          <q-separator class="q-my-md" />
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="description" class="q-mr-sm" />
            {{ t('item.description') }}
          </div>
          <div class="description-text">
            {{ itemData.description }}
          </div>        </div>
      </q-card-section>

      <!-- Fallback when no item data -->
      <q-card-section v-else class="q-pa-md text-center">
        <q-icon name="inventory_2" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ t('common.noDataAvailable') }}</div>
        <div class="text-body2 text-grey-5">{{ t('item.noItemSelected') }}</div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          :label="t('common.close')"
          color="primary"
          flat
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar, date } from 'quasar'
import type { Product } from 'src/types/item'

// Composables
const $q = useQuasar()

interface Props {
  modelValue: boolean;
  itemData?: Product | null;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>()

const { t } = useI18n()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Helper functions for safe formatting
const formatCurrency = (value: any): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0.00';
  }
  return Number(value).toFixed(2);
}

const formatPercentage = (value: any): string => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toFixed(1);
}

const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss" scoped>
.item-details-card {
  border-radius: 4;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .modal-header {
    background: #2A7B9B;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .text-h5 {
      color: white !important;
      margin: 0;
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .q-btn {
      color: white !important;
    }
  }
}

.item-summary {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  font-size: 24px;
}

.summary-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.pricing-section {
  background: rgba(var(--q-secondary-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.price-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.price-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.price-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 4px;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
}

.package-section {
  background: rgba(var(--q-accent-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.package-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.package-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.package-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 4px;
}

.package-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.package-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--q-positive);
}

.physical-section {
  background: rgba(var(--q-info-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.property-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.property-icon {
  font-size: 24px;
}

.property-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 2px;
}

.property-value {
  font-size: 14px;
  font-weight: 600;
}

.description-section {
  background: rgba(var(--q-warning-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.description-text {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid var(--q-primary);
  font-style: italic;
  line-height: 1.5;
}

:deep(.q-dialog__inner) {
  padding: 16px;
}

:deep(.q-card) {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

<style scoped>
.item-details-card {
  width: 100%;
  max-width: 900px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .item-details-card {
    border-radius: 0;

    .modal-header {
      padding: 12px 16px;

      .text-h5 {
        font-size: 1.1rem;
        line-height: 1.2;
      }
    }

    .col-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .col-4 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .col-3 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    /* Adjust padding for mobile */
    .q-card-section {
      padding: 12px 16px;
    }

    .summary-item, .property-item {
      flex-direction: column;
      align-items: flex-start !important;
      text-align: left;
    }

    .summary-icon, .property-icon {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .item-details-card {
    font-size: 14px;

    .text-h6 {
      font-size: 1.1rem;
    }

    /* Make form more compact on very small screens */
    .q-card-section {
      padding: 8px 12px;
    }
  }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .item-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned */
.item-details-dialog .q-dialog__inner {
  padding: 0;
}

.item-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .item-details-dialog .q-dialog__inner {
    padding: 0 !important;
  }

  .item-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style>
