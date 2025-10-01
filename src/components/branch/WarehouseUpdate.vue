<template>
  <QModalForm
    v-model="model"
    :title="t('warehouse.update', 'Update Warehouse')"
    :show-user-info="true"
    :user-name="form.name"
    :default-user-name="t('warehouse.warehouseDetails', 'Warehouse Details')"
    user-role="Warehouse"
    :user-icon="'inventory'"
  >
    <template #default>
      <q-form @submit.prevent="submitForm" ref="formRef">
        <div class="q-pa-md">
          <!-- Form content in a two-column grid -->
          <div class="row q-col-gutter-md">
            <!-- Left Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('warehouse.basicInfo', 'Basic Information') }}</div>

              <Qinput
                v-model="form.name"
                :label="t('warehouse.name', 'Warehouse Name')"
                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="inventory" color="primary" />
                </template>
              </Qinput>

              <Qinput
                v-model="form.code"
                :label="t('warehouse.code', 'Warehouse Code')"
                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="qr_code" color="primary" />
                </template>
              </Qinput>
            </div>

            <!-- Right Column -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 text-primary q-mb-sm">{{ t('warehouse.details', 'Warehouse Details') }}</div>

              <Qinput
                v-model="form.address"
                :label="t('warehouse.address', 'Warehouse Address')"
                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="location_on" color="primary" />
                </template>
              </Qinput>

              <Qinput
                v-model.number="form.capacity"
                :label="t('warehouse.capacity', 'Storage Capacity')"
                type="number"
                :rules="[
                  val => !!val || t('validation.required', 'This field is required'),
                  val => (val && Number(val) > 0) || t('validation.positive', 'Value must be positive')
                ]"
                outlined
                class="enhanced-input"
              >
                <template #before>
                  <q-icon name="storage" color="primary" />
                </template>
              </Qinput>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row justify-end q-gutter-sm">
            <Qbtn
              :btn-label="t('common.cancel', 'Cancel')"
              color="negative"
              :is-flat="true"
              :no-caps="true"
              @click="model = false"
            />
            <Qbtn
              type="submit"
              :btn-label="t('warehouse.updateBtn', 'Update Warehouse')"
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
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWarehouseStore } from 'src/stores/warehouseStore';
import type { Warehouse } from 'src/types/warehouse';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import Qbtn from 'src/components/common/Qbtn.vue';

const emit = defineEmits(['update:modelValue', 'update']);

const props = defineProps({
    branch_id: {
        type: Number,
        default: 0
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    warehouse: {
        type: Object as () => Warehouse,
        required: true
    }
});

const { t } = useI18n();
const warehouseStore = useWarehouseStore();
const loading = ref(false);
const formRef = ref<{validate: () => Promise<boolean>} | null>(null);

// Two-way binding for dialog visibility
const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// Form data
const form = reactive({
    id: 0,
    name: '',
    code: '',
    branch_id: 0,
    address: '',
    capacity: 0
});

// Watch for changes in the warehouse prop to update the form
watch(() => props.warehouse, (newWarehouse) => {
    if (newWarehouse) {
        form.id = newWarehouse.id;
        form.name = newWarehouse.name;
        form.code = newWarehouse.code;
        form.branch_id = props.branch_id;
        form.address = newWarehouse.address;
        form.capacity = newWarehouse.capacity;
    }
}, { immediate: true });

// Submit the form
async function submitForm() {
    if (loading.value || !form.id) return;

    // Validate form
    const formComponent = formRef.value;
    if (formComponent && !(await formComponent.validate())) {
      return;
    }

    loading.value = true;
    try {
        // Prepare payload without id
        const payload = {
            name: form.name,
            code: form.code,
            branch_id: form.branch_id,
            address: form.address,
            capacity: form.capacity
        };
        // Call API to update warehouse
        const success = await warehouseStore.updateWarehouse(form.id, payload);
        if (success) {
            model.value = false;
            // showNotify({
            //     message: t('warehouse.updateSuccess', 'Warehouse updated successfully'),
            //     type: 'positive'
            // });
            // Emit event to parent
            emit('update');
        }
    } finally {
        loading.value = false;
    }
}
</script>


