<template>
  <QModalForm
    v-model="model"
    :title="t('warehouse.add', 'Add New Warehouse')"
    :show-user-info="true"
    :user-name="form.name"
    :default-user-name="t('warehouse.newWarehouse', 'New Warehouse')"
    :user-role="t('warehouse.role', 'Warehouse')"
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
              :btn-label="t('warehouse.addBtn', 'Add Warehouse')"
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
import { showNotify } from 'src/composables/Notify';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import Qbtn from 'src/components/common/Qbtn.vue';

const emit = defineEmits(['update:modelValue', 'submit']);

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    branchId: {
        type: Number,
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

// Form data with branch_id properly defaulted
const form = reactive({
    name: '',
    code: '',
    branch_id: props.branchId,
    address: '',
    capacity: 0
});

// Watch for branch ID changes to update form
watch(() => props.branchId, (newBranchId) => {
    form.branch_id = newBranchId;
});

// Reset form when modal closes
watch(model, (newVal) => {
    if (newVal === false) {
        resetForm();
    }
});

function resetForm() {
    form.name = '';
    form.code = '';
    form.address = '';
    form.capacity = 0;
    // Keep branch_id as it should maintain the current branch
    form.branch_id = props.branchId;
}

// Submit the form
async function submitForm() {
    if (loading.value) return;

    // Validate form
    const formComponent = formRef.value;
    if (formComponent && !(await formComponent.validate())) {
      return;
    }

    loading.value = true;
    try {
        // Ensure branch_id is set correctly before submission
        const payload = {
            ...form,
            branch_id: props.branchId  // Explicitly set branch_id from props
        };

        // Call API to create warehouse using the store
        const success = await warehouseStore.createWarehouse(payload);
        if (success) {
            model.value = false;
            showNotify({
                message: t('warehouse.addSuccess', 'Warehouse created successfully'),
                type: 'positive'
            });
            // Emit event to parent
            emit('submit');
        }
    } finally {
        loading.value = false;
    }
}
</script>


