<template>
  <q-dialog
    v-model="isVisible"
    persistent
    maximized-mobile
    class="archive-modal"
  >
    <q-card class="archive-modal-card">
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <div class="col">
            <div class="archive-header">
              <q-icon name="archive" color="warning" size="2.5rem" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">{{ $t('item.archiveItem') }}</div>
                <div class="text-caption text-grey-7">{{ $t('item.archiveWarning') }}</div>
              </div>
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="closeModal"
              :disable="loading"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section v-if="item">
        <!-- Item Information -->
        <div class="item-info-section q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ $t('item.itemInformation') }}
          </div>
          
          <q-card flat bordered class="item-details-card">
            <q-card-section class="q-pa-md">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-sm-12">
                  <div class="info-item">
                    <div class="info-label">{{ $t('item.name') }}</div>
                    <div class="info-value">{{ item.name }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-sm-12">
                  <div class="info-item">
                    <div class="info-label">{{ $t('item.sku') }}</div>
                    <div class="info-value">{{ item.sku }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-sm-12">
                  <div class="info-item">
                    <div class="info-label">{{ $t('item.category') }}</div>
                    <div class="info-value">{{ item.category?.name || '-' }}</div>
                  </div>
                </div>
                <div class="col-md-6 col-sm-12">
                  <div class="info-item">
                    <div class="info-label">{{ $t('item.totalQuantity') }}</div>
                    <div class="info-value">
                      <q-chip
                        :color="item.total_quantity === 0 ? 'positive' : 'negative'"
                        text-color="white"
                        :icon="item.total_quantity === 0 ? 'check_circle' : 'warning'"
                      >
                        {{ formatNumber(item.total_quantity || 0) }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Warning Messages -->
        <div class="warnings-section q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ $t('item.archiveWarnings') }}
          </div>

          <!-- Stock Check Warning -->
          <q-card
            flat
            :class="item.total_quantity === 0 ? 'bg-positive text-white' : 'bg-negative text-white'"
            class="q-mb-md"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center">
                <q-icon
                  :name="item.total_quantity === 0 ? 'check_circle' : 'error'"
                  size="1.5rem"
                  class="q-mr-md"
                />
                <div class="col">
                  <div class="text-weight-medium">{{ $t('item.stockCheck') }}</div>
                  <div class="text-body2">
                    {{ item.total_quantity === 0 
                        ? $t('item.noStockRemaining') 
                        : $t('item.stockStillRemaining', { quantity: item.total_quantity })
                    }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- General Archive Warnings -->
          <q-card flat class="bg-info text-warning">
            <q-card-section class="q-pa-md">
              <div class="row items-start">
                <q-icon name="warning" size="1.5rem" class="q-mr-md q-mt-xs" />
                <div class="col">
                  <div class="text-weight-medium q-mb-sm">{{ $t('item.archiveConsequences') }}</div>
                  <ul class="archive-warnings-list">
                    <li>{{ $t('item.archiveWarning1') }}</li>
                    <li>{{ $t('item.archiveWarning2') }}</li>
                    <li>{{ $t('item.archiveWarning3') }}</li>
                    <!-- <li>{{ $t('item.archiveWarning4') }}</li> -->
                  </ul>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Confirmation Section -->
        <div class="confirmation-section">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            {{ $t('item.confirmArchive') }}
          </div>
          
          <q-card flat bordered>
            <q-card-section class="q-pa-md">
              <q-checkbox
                v-model="confirmArchive"
                :disable="item.total_quantity > 0"
                color="primary"
                class="q-mb-md"
              >
                <span class="text-body2">
                  {{ $t('item.confirmArchiveText') }}
                </span>
              </q-checkbox>

              <div v-if="item.total_quantity > 0" class="text-negative text-body2">
                <q-icon name="block" class="q-mr-xs" />
                {{ $t('item.cannotArchiveWithStock') }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          :label="$t('common.cancel')"
          @click="closeModal"
          :disable="loading"
          class="q-mr-sm"
        />
        <q-btn
          color="warning"
          text-color="red"
          :label="$t('item.archiveNow')"
          icon="archive"
          @click="handleArchive"
          :loading="loading"
          :disable="!canArchive"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Product } from 'src/types/item';
import { useItemStore } from 'src/stores/itemStore';
import { formatNumber } from 'src/composables/useFormat';

// Props and emits
interface Props {
  modelValue: boolean;
  item: Product | null;
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void;
  (_e: 'archived'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const _t = useI18n();
const itemStore = useItemStore();

// Reactive state
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const confirmArchive = ref(false);
const loading = ref(false);

// Check if item can be archived
const canArchive = computed(() => {
  return props.item && 
         props.item.total_quantity === 0 && 
         confirmArchive.value;
});

// Reset confirmation when modal opens/closes or item changes
watch([isVisible, () => props.item], () => {
  confirmArchive.value = false;
}, { immediate: true });

// Methods
function closeModal() {
  if (!loading.value) {
    isVisible.value = false;
  }
}

async function handleArchive() {
  if (!props.item || !canArchive.value) return;

  loading.value = true;
  
  try {
    const success = await itemStore.archiveItem(props.item.id);
    
    if (success) {
      emit('archived');
      closeModal();
    }
  } catch (error) {
    console.error('Error archiving item:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.archive-modal-card {
  width: 100%;
  max-width: 700px;
  border-radius: 12px;
}

.archive-header {
  display: flex;
  align-items: center;
}

.item-info-section {
  .item-details-card {
    background-color: #fafafa;
    border-radius: 8px;
  }
  
  .info-item {
    margin-bottom: 0.75rem;
    
    .info-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 1rem;
      color: #333;
      font-weight: 600;
    }
  }
}

.warnings-section {
  .archive-warnings-list {
    margin: 0;
    padding-left: 1.2rem;
    
    li {
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.4;
    }
  }
}

.confirmation-section {
  .q-checkbox {
    :deep(.q-checkbox__label) {
      line-height: 1.4;
    }
  }
}

// Mobile responsive adjustments
@media (max-width: 600px) {
  .archive-modal-card {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .info-item {
    margin-bottom: 1rem;
  }
}
</style>
