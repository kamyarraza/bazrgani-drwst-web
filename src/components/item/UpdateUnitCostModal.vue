<template>
  <QModalForm v-model="model" :title="t('item.updateUnitCost')" :show-user-info="false">
    <template #default>
      <q-form @submit.prevent="submitForm">
        <div class="q-pa-md">
          <!-- Item Info Display -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.itemInfo') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input 
                  :model-value="props.item?.name || ''" 
                  :label="t('item.productName')" 
                  outlined 
                  readonly
                  class="disabled-input"
                >
                  <template #before>
                    <q-icon name="inventory_2" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input 
                  :model-value="props.item?.sku || ''" 
                  :label="t('item.sku')" 
                  outlined 
                  readonly
                  class="disabled-input"
                >
                  <template #before>
                    <q-icon name="qr_code" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- Current Unit Cost Display -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.currentUnitCost') }}</div>
            <q-input 
              :model-value="formatCurrency(props.item?.unit_cost || 0)" 
              :label="t('item.currentUnitCost')" 
              outlined 
              readonly
              class="disabled-input"
            >
              <template #before>
                <q-icon name="attach_money" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Admin Warning for Non-Admin Users -->
          <div v-if="!isAdmin" class="q-mb-md">
            <q-banner class="bg-warning text-white rounded-borders">
              <template #avatar>
                <q-icon name="warning" color="white" />
              </template>
              <div class="text-weight-medium">{{ t('common.warning') }}</div>
              <div class="text-caption">{{ t('common.approvalRequired') }}</div>
            </q-banner>
          </div>

          <!-- New Unit Cost Input -->
          <div class="q-mb-md">
            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.newUnitCost') }}</div>
            <Qinput 
              v-model.number="form.unit_cost" 
              :label="t('item.unitCost')" 
              type="number" 
              step="0.01"
              :rules="[val => (val != null && Number(val) > 0) || t('validation.positiveNumber')]" 
              outlined 
              class="enhanced-input"
            >
              <template #before>
                <q-icon name="price_change" color="primary" />
              </template>
            </Qinput>
          </div>

          <q-separator class="q-my-md" />

          <div class="row justify-end q-gutter-sm">
            <Qbtn 
              :btn-label="t('common.cancel')" 
              color="negative" 
              :is-flat="true" 
              :no-caps="true"
              @click="model = false" 
            />
            <Qbtn 
              type="submit" 
              :btn-label="isAdmin ? t('item.updateCost') : t('item.requestUpdate')" 
              color="primary" 
              :is-rounded="false" 
              :no-caps="true"
              :loading="loading" 
            />
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

const emit = defineEmits(['unit-cost-updated', 'unit-cost-request-submitted', 'close-modal'])
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

// Form for unit cost update only
const form = reactive({
  unit_cost: 0,
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
    form.unit_cost = props.item.unit_cost || 0
    form.reason = ''
  }
})

async function submitForm() {
  if (!props.item?.id) return

  loading.value = true
  try {
    let success = false

    // Admin can update directly
    success = await itemStore.updateItemUnitCost(props.item.id, form.unit_cost)

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
