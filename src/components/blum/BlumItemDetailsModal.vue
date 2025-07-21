<template>
  <q-dialog
    v-model="isVisible"
    class="blum-item-details-dialog"
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
  >
    <q-card class="blum-item-details-card">
      <!-- Beautiful Modal Header -->
      <div class="modal-header">
        <div class="text-h5">
          <q-icon name="precision_manufacturing" class="q-mr-sm" />
          {{ t('blum.itemDetails') }}
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
        <!-- Item Summary -->
        <div class="item-summary q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="precision_manufacturing" class="summary-icon text-primary" />
                <div>
                  <div class="summary-label">{{ t('blum.itemName') }}</div>
                  <div class="summary-value">{{ itemData?.name || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="qr_code" class="summary-icon text-blue" />
                <div>
                  <div class="summary-label">{{ t('blum.itemCode') }}</div>
                  <div class="summary-value">{{ itemData?.code || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="settings" class="summary-icon text-purple" />
                <div>
                  <div class="summary-label">{{ t('blum.partNumber') }}</div>
                  <div class="summary-value">{{ itemData?.part_no || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="tag" class="summary-icon text-orange" />
                <div>
                  <div class="summary-label">{{ t('common.id') }}</div>
                  <div class="summary-value">#{{ itemData?.id || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Item Image Section (if available) -->
        <div v-if="itemData?.image" class="image-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="image" class="q-mr-sm" />
            {{ t('blum.itemImage') }}
          </div>
          <div class="row justify-center">
            <div class="col-12 col-md-6">
              <q-img
                :src="itemData.image"
                :alt="itemData.name"
                fit="contain"
                class="rounded-borders"
                style="max-height: 300px; width: 100%;"
                loading="lazy"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                    <q-icon name="broken_image" size="3rem" />
                  </div>
                </template>
              </q-img>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Pricing & Inventory Information -->
        <div class="pricing-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="attach_money" class="q-mr-sm" />
            {{ t('blum.pricingInventory') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="property-item">
                <q-icon name="shopping_cart" class="property-icon text-green" />
                <div>
                  <div class="property-label">{{ t('blum.unitCost') }}</div>
                  <div class="property-value">{{ formatCurrency(itemData?.unit_cost) }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="property-item">
                <q-icon name="sell" class="property-icon text-blue" />
                <div>
                  <div class="property-label">{{ t('blum.unitPrice') }}</div>
                  <div class="property-value">{{ formatCurrency(itemData?.unit_price) }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="property-item">
                <q-icon name="inventory" class="property-icon text-purple" />
                <div>
                  <div class="property-label">{{ t('blum.quantity') }}</div>
                  <div class="property-value">{{ itemData?.quantity || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="col-6" v-if="itemData?.position">
              <div class="property-item">
                <q-icon name="place" class="property-icon text-orange" />
                <div>
                  <div class="property-label">{{ t('blum.position') }}</div>
                  <div class="property-value">{{ itemData.position }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Blum Brand Information -->
        <q-separator class="q-my-md" />

        <div class="blum-info-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="construction" class="q-mr-sm" />
            {{ t('blum.blumSpecific') }}
          </div>

          <div class="info-cards-grid">
            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="business" size="2rem" class="text-primary q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('blum.manufacturer') }}</div>
                <div class="text-h6 text-weight-bold">BLUM</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="category" size="2rem" class="text-secondary q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('blum.category') }}</div>
                <div class="text-h6 text-weight-bold">{{ t('blum.hardwareComponent') }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="verified" size="2rem" class="text-positive q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('common.status') }}</div>
                <div class="text-h6 text-weight-bold text-positive">{{ t('common.active') }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Fallback when no item data -->
      <q-card-section v-else class="q-pa-md text-center">
        <q-icon name="precision_manufacturing" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ t('common.noDataAvailable') }}</div>
        <div class="text-body2 text-grey-5">{{ t('blum.noItemSelected') }}</div>
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
import type { BlumItem as OriginalBlumItem } from 'src/types/blumTypes'
import type { BlumItem as ExtendedBlumItem } from 'src/types/warehouse_item'

// Union type to handle both old and new BlumItem formats
type BlumItemData = OriginalBlumItem & Partial<Pick<ExtendedBlumItem, 'unit_cost' | 'unit_price' | 'quantity' | 'position'>>

// Composables
const $q = useQuasar()
const { t } = useI18n()

interface Props {
  modelValue: boolean;
  itemData?: BlumItemData | null;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Methods
function _formatDate(dateString: string): string {
  return date.formatDate(dateString, 'YYYY-MM-DD HH:mm')
}

function formatCurrency(value: string | number | undefined | null): string {
  if (!value) return t('common.notSet')
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return t('common.notSet')
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue)
}
</script>

<style scoped lang="scss">
.blum-item-details-card {
  width: 100%;
  max-width: 900px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .modal-header {
    background: linear-gradient(135deg, var(--q-secondary) 0%, #1565c0 100%);
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
  background: rgba(var(--q-secondary-rgb), 0.05);
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
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.property-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 8px;
}

.property-icon {
  font-size: 20px;
}

.property-label {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  border: 2px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--q-secondary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.image-section {
  .q-img {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .blum-item-details-card {
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

    .info-cards-grid {
      grid-template-columns: 1fr;
    }

    .q-card-section {
      padding: 8px 12px;
    }
  }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .blum-item-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned */
.blum-item-details-dialog .q-dialog__inner {
  padding: 0;
}

.blum-item-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .blum-item-details-dialog .q-dialog__inner {
    padding: 0 !important;
  }

  .blum-item-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style>
