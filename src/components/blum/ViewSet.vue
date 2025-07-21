<template>
  <q-dialog
    v-model="isOpen"
    class="blum-set-details-dialog"
    :maximized="$q.screen.lt.md"
    :full-width="$q.screen.lt.md"
  >
    <q-card class="blum-set-details-card">
      <!-- Beautiful Modal Header -->
      <div class="modal-header">
        <div class="text-h5">
          <q-icon name="category" class="q-mr-sm" />
          {{ t('blum.viewSetDetails') }}
        </div>
        <q-btn
          icon="close"
          flat
          round
          v-close-popup
          size="sm"
        />
      </div>

      <!-- Loading State -->
      <q-card-section v-if="blumStore.blumSetsLoading" class="q-pa-xl text-center">
        <q-spinner-dots color="primary" size="4rem" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ t('common.loading') }}...</div>
      </q-card-section>

      <!-- Set Details Content -->
      <q-card-section v-else-if="currentSet" class="q-pa-md">
        <!-- Set Summary -->
        <div class="set-summary q-mb-md">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="category" class="summary-icon text-primary" />
                <div>
                  <div class="summary-label">{{ t('blum.setName') }}</div>
                  <div class="summary-value">{{ currentSet?.name || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="summary-item">
                <q-icon name="fingerprint" class="summary-icon text-blue" />
                <div>
                  <div class="summary-label">{{ t('common.id') }}</div>
                  <div class="summary-value">#{{ currentSet?.id || t('common.notSet') }}</div>
                </div>
              </div>
            </div>
            <div class="col-12" v-if="currentSet?.description">
              <div class="summary-item">
                <q-icon name="description" class="summary-icon text-purple" />
                <div>
                  <div class="summary-label">{{ t('blum.setDescription') }}</div>
                  <div class="summary-value">{{ currentSet.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Set Image Section (if available) -->
        <div v-if="currentSet?.image" class="image-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="image" class="q-mr-sm" />
            {{ t('blum.setImage') }}
          </div>
          <div class="row justify-center">
            <div class="col-12 col-md-6">
              <q-img
                :src="currentSet.image"
                :alt="currentSet.name"
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

        <!-- Set Statistics -->
        <div class="statistics-section q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="analytics" class="q-mr-sm" />
            {{ t('blum.setStatistics') }}
          </div>

          <div class="info-cards-grid">
            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="inventory" size="2rem" class="text-primary q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('blum.totalItems') }}</div>
                <div class="text-h6 text-weight-bold">{{ currentSet?.items?.length || 0 }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="add_box" size="2rem" class="text-secondary q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('blum.totalQuantity') }}</div>
                <div class="text-h6 text-weight-bold">{{ totalQuantity }}</div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="info-card">
              <q-card-section class="text-center">
                <q-icon name="business" size="2rem" class="text-orange q-mb-sm" />
                <div class="text-caption text-grey-6">{{ t('blum.manufacturer') }}</div>
                <div class="text-h6 text-weight-bold">BLUM</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Set Items -->
        <div class="items-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ t('blum.setItems') }} ({{ currentSet?.items?.length || 0 }})
          </div>

          <div v-if="currentSet?.items && currentSet.items.length > 0">
            <q-list separator class="rounded-borders items-list">
              <q-item
                v-for="(setItem, index) in currentSet.items"
                :key="setItem.item_id || index"
                class="item-list-item"
              >
                <q-item-section avatar>
                  <q-avatar size="56px" rounded class="item-avatar-enhanced">
                    <img
                      v-if="getItemDetails(setItem.item_id)?.image"
                      :src="getItemDetails(setItem.item_id)!.image"
                      :alt="setItem.name || 'Item'"
                      style="object-fit: cover;"
                    />
                    <q-icon v-else name="precision_manufacturing" size="28px" color="blue-grey-5" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="item-name">
                    {{ setItem.name || getItemDetails(setItem.item_id)?.name || 'Unknown Item' }}
                  </q-item-label>

                  <q-item-label caption class="item-details">
                    <div class="item-codes">
                      <span v-if="setItem.code || getItemDetails(setItem.item_id)?.code" class="item-code-chip">
                        <q-icon name="qr_code" size="xs" />
                        {{ setItem.code || getItemDetails(setItem.item_id)?.code }}
                      </span>
                      <span v-if="setItem.part_no || getItemDetails(setItem.item_id)?.part_no" class="item-part-chip">
                        <q-icon name="tag" size="xs" />
                        {{ setItem.part_no || getItemDetails(setItem.item_id)?.part_no }}
                      </span>
                    </div>
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="item-quantity-section">
                  <q-chip
                    size="lg"
                    color="positive"
                    text-color="white"
                    icon="add_box"
                    class="quantity-chip"
                  >
                    {{ setItem.quantity }}
                  </q-chip>
                  <div class="quantity-label">
                    {{ t('blum.quantity') }}
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-else class="no-items-state text-center q-pa-lg">
            <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-md" />
            <div class="text-h6 text-grey-6">{{ t('blum.noItemsInSet') }}</div>
            <div class="text-body2 text-grey-5">{{ t('blum.setIsEmpty') }}</div>
          </div>
        </div>

        <!-- Creation Information -->
        <q-separator class="q-my-md" />

        <div class="creation-info-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            <q-icon name="info" class="q-mr-sm" />
            {{ t('blum.creationInfo') }}
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6" v-if="currentSet?.created_at">
              <div class="property-item">
                <q-icon name="schedule" class="property-icon text-grey" />
                <div>
                  <div class="property-label">{{ t('common.createdAt') }}</div>
                  <div class="property-value">{{ formatDate(currentSet.created_at) }}</div>
                </div>
              </div>
            </div>
            <div class="col-6" v-if="currentSet?.updated_at">
              <div class="property-item">
                <q-icon name="update" class="property-icon text-grey" />
                <div>
                  <div class="property-label">{{ t('common.updatedAt') }}</div>
                  <div class="property-value">{{ formatDate(currentSet.updated_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Fallback when no set data -->
      <q-card-section v-else class="q-pa-md text-center">
        <q-icon name="category" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ t('common.noDataAvailable') }}</div>
        <div class="text-body2 text-grey-5">{{ t('blum.noSetSelected') }}</div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBlumStore } from 'src/stores/blumStore';
import { date } from 'quasar';
import type { BlumSet, BlumItem } from 'src/types/blumTypes';

const { t } = useI18n();
const blumStore = useBlumStore();

const props = defineProps<{
  modelValue: boolean;
  setId?: number;
}>();

const emit = defineEmits<{
  (_event: 'update:modelValue', _value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const currentSet = ref<BlumSet | null>(null);
const itemsMap = ref<Record<number, BlumItem>>({});

// Computed property for total quantity in the set
const totalQuantity = computed(() => {
  if (!currentSet.value || !currentSet.value.items) return 0;
  return currentSet.value.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Helper function to get item details from the items map
function getItemDetails(itemId: number): BlumItem | undefined {
  return itemsMap.value[itemId];
}

function formatDate(dateString: string) {
  if (!dateString) return '-';
  return date.formatDate(dateString, 'YYYY-MM-DD HH:mm');
}

async function fetchSetDetails() {
  if (!props.setId) return;

  const setDetails = await blumStore.getBlumSetDetails(props.setId);
  if (setDetails) {
    currentSet.value = setDetails;
  }
}

async function loadItemsData() {
  // If we don't have any items yet, fetch them
  if (blumStore.blumItems.length === 0) {
    await blumStore.fetchBlumItems();
  }

  // Create a map of item_id to item details for quick lookup
  itemsMap.value = blumStore.blumItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<number, BlumItem>);
}

watch(isOpen, (newVal) => {
  if (newVal && props.setId) {
    void fetchSetDetails();
    void loadItemsData();
  } else {
    currentSet.value = null;
  }
});

watch(() => props.setId, (newId) => {
  if (newId && isOpen.value) {
    void fetchSetDetails();
  }
});

onMounted(() => {
  if (isOpen.value && props.setId) {
    void fetchSetDetails();
    void loadItemsData();
  }
});
</script>

<style scoped lang="scss">
.blum-set-details-card {
  width: 100%;
  max-width: 900px;
  min-width: 300px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .modal-header {
    background: linear-gradient(135deg, var(--q-secondary) 0%, #1565c0 100%);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0; /* Prevent header from shrinking */

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

  /* Make the card section scrollable */
  .q-card__section {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;

    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }

  /* Card actions should stay at bottom */
  .q-card__actions {
    flex-shrink: 0;
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    background: white;
  }
}

.set-summary {
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

/* Items List Styling */
.items-list {
  border: 1px solid #e0e0e0;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;

  /* Custom scrollbar for items list */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 3px;

    &:hover {
      background: #adb5bd;
    }
  }
}

.item-list-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 16px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-avatar-enhanced {
  border: 2px solid #e0e0e0;
  background: #f5f5f5;
}

.item-name {
  font-weight: 600;
  font-size: 16px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.item-details {
  margin-top: 4px;
}

.item-codes {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.item-code-chip, .item-part-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.item-part-chip {
  background: #f3e5f5;
  color: #7b1fa2;
}

.item-quantity-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.quantity-chip {
  margin-bottom: 4px;
}

.quantity-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-items-state {
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .blum-set-details-card {
    border-radius: 0;
    max-height: 100vh; /* Full height on mobile */

    .modal-header {
      padding: 12px 16px;

      .text-h5 {
        font-size: 1.1rem;
        line-height: 1.2;
      }
    }

    .q-card__section {
      padding: 12px 16px;
    }

    .q-card__actions {
      padding: 12px 16px;
    }

    .col-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .info-cards-grid {
      grid-template-columns: 1fr;
    }

    .items-list {
      max-height: 250px; /* Smaller on mobile but still scrollable */
    }

    .item-list-item {
      padding: 8px 12px;
    }

    .item-avatar-enhanced {
      width: 48px !important;
      height: 48px !important;
    }

    .item-name {
      font-size: 14px;
    }

    .item-codes {
      gap: 4px;
    }
  }
}

/* Tablet responsive styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .blum-set-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

/* Ensure dialog is properly positioned and scrollable */
.blum-set-details-dialog .q-dialog__inner {
  padding: 16px;
  overflow-y: auto; /* Allow scrolling in dialog container */
}

.blum-set-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .blum-set-details-dialog .q-dialog__inner {
    padding: 0 !important;
    overflow-y: auto !important;
  }

  .blum-set-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style>
