<template>
  <QModalForm v-model="model" :title="t('item.updatePrices')" :show-user-info="false">
    <template #default>
      <q-form @submit.prevent="submitForm">
        <div class="q-pa-md">
          <!-- Item Info Display -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.itemInfo') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input :model-value="props.item?.name || ''" :label="t('item.productName')" outlined readonly
                  class="disabled-input">
                  <template #before>
                    <q-icon name="inventory_2" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="props.item?.sku || ''" :label="t('item.sku')" outlined readonly
                  class="disabled-input">
                  <template #before>
                    <q-icon name="qr_code" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Current Stock Quantities -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.currentStock') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-md-4 col-sm-12">
                <q-input :model-value="formatNumber(props.item?.packages || 0)" :label="t('item.packages')" outlined readonly
                  class="disabled-input">
                  <template #before>
                    <q-icon name="inventory_2" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-4 col-sm-12">
                <q-input :model-value="formatNumber(props.item?.packets || 0)" :label="t('item.packets')" outlined readonly
                  class="disabled-input">
                  <template #before>
                    <q-icon name="view_module" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-md-4 col-sm-12">
                <q-input :model-value="formatNumber(props.item?.pieces || 0)" :label="t('item.pieces')" outlined readonly
                  class="disabled-input">
                  <template #before>
                    <q-icon name="circle" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-input :model-value="formatNumber(props.item?.total_quantity || 0)" :label="t('item.totalQuantity')" outlined
                  readonly class="disabled-input total-quantity">
                  <template #before>
                    <q-icon name="straighten" color="positive" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Current Prices Display -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.currentPrices') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input :model-value="formatCurrency(props.item?.solo_unit_price || 0)"
                  :label="t('item.soloUnitPrice')" outlined readonly class="disabled-input">
                  <template #before>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="formatCurrency(props.item?.bulk_unit_price || 0)"
                  :label="t('item.bulkUnitPrice')" outlined readonly class="disabled-input">
                  <template #before>
                    <q-icon name="inventory" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- New Prices Input -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.newPrices') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <Qinput v-model.number="form.solo_unit_price" :label="t('item.soloUnitPrice')" type="number" step="0.01"
                  :rules="[val => (val != null && Number(val) > 0) || t('validation.positiveNumber')]" outlined
                  class="enhanced-input">
                  <template #before>
                    <q-icon name="person" color="primary" />
                  </template>
                </Qinput>
              </div>
              <div class="col-12 col-md-6">
                <Qinput v-model.number="form.bulk_unit_price" :label="t('item.bulkUnitPrice')" type="number" step="0.01"
                  :rules="[val => (val != null && Number(val) > 0) || t('validation.positiveNumber')]" outlined
                  class="enhanced-input">
                  <template #before>
                    <q-icon name="inventory" color="primary" />
                  </template>
                </Qinput>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row justify-end q-gutter-sm">
            <Qbtn :btn-label="t('common.cancel')" color="negative" :is-flat="true" :no-caps="true"
              @click="model = false" />
            <Qbtn type="submit" :btn-label="isAdmin ? t('item.updatePrices') : t('item.requestUpdate')" color="primary"
              :is-rounded="false" :no-caps="true" :loading="loading" />
          </div>
        </div>
      </q-form>
    </template>
  </QModalForm>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useItemStore } from 'src/stores/itemStore'
import { useAuthStore } from 'src/stores/authStore'
import type { Product } from 'src/types/item'
import { formatNumber } from 'src/composables/useFormat'

const emit = defineEmits(['prices-updated', 'prices-request-submitted', 'close-modal'])
const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const itemStore = useItemStore()
const authStore = useAuthStore()

const props = defineProps({
  item: {
    type: Object as () => Product | undefined,
    default: undefined
  }
})

const loading = ref(false)

// Check if current user is admin
const isAdmin = computed(() => {
  return authStore.user?.type === 'admin'
})

// Form for price updates
const form = reactive({
  solo_unit_price: 0,
  bulk_unit_price: 0,
  reason: ''
})

// Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Reset form when modal opens
watch(model, (newVal) => {
  if (newVal && props.item) {
    form.solo_unit_price = props.item.solo_unit_price || 0
    form.bulk_unit_price = props.item.bulk_unit_price || 0
    form.reason = ''
  }
})

async function submitForm() {
  if (!props.item?.id) return

  loading.value = true
  try {
    // Admin can update directly
    await itemStore.updateItemPrices(props.item.id, {
      solo_unit_price: form.solo_unit_price,
      bulk_unit_price: form.bulk_unit_price
    })

    emit('prices-updated')
  } finally {
    loading.value = false
    emit('close-modal')
  }
}
</script>

<style lang="scss" scoped>
.disabled-input {
  background-color: #f5f5f5;
}
</style>
