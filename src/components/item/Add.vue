<template>
    <QModalForm
        v-model="model"
        :title="t('item.add')"
        :show-user-info="false"
        :user-name="form.name || ''"
        :default-user-name="t('item.newItem')"
        :user-role="t('item.role')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.basicInfo') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('item.productName')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="inventory_2" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.sku"
                                :label="t('item.sku')"
                                :rules="[val => !!val || t('validation.required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="qr_code" color="primary" />
                                </template>
                            </Qinput>

                            <div class="q-mb-md">
                                <q-select
                                    v-model="form.item_category_id"
                                    :options="categoryOptions"
                                    option-value="id"
                                    option-label="name"
                                    :label="t('item.category')"
                                    outlined
                                    emit-value
                                    map-options
                                    class="enhanced-input"
                                    :rules="[val => (val !== null && val !== 0) || t('validation.required')]"
                                >
                                    <template #before>
                                        <q-icon name="category" color="primary" />
                                    </template>
                                </q-select>
                            </div>

                            <Qinput
                                v-model="form.description"
                                :label="t('item.description')"
                                type="textarea"
                                outlined
                                class="enhanced-input"
                                autogrow

                            >
                                <template #before>
                                    <q-icon name="description" color="primary" />
                                </template>
                            </Qinput>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('item.pricingMeasurements') }}</div>

                            <Qinput
                                v-model.number="form.weight_kg"
                                :label="t('item.weight')"
                                type="number"
                                step="0.1"
                                :rules="[val => Number(val) >= 0 || t('item.negativeWeight')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="scale" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model.number="form.volume"
                                :label="t('item.volume')"
                                type="number"
                                step="0.1"
                                :rules="[val => Number(val) >= 0 || t('item.negativeVolume')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="view_in_ar" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model.number="form.min_qty"
                                :label="t('item.minQuantity', 'Minimum Quantity')"
                                type="number"
                                step="1"
                                :rules="[val => val === null || val === undefined || Number(val) >= 0 || t('item.negativeQuantity', 'Quantity cannot be negative')]"
                                outlined
                                class="enhanced-input"
                                :hint="t('item.minQuantityHint', 'Minimum stock level for notifications')"
                            >
                                <template #before>
                                    <q-icon name="priority_high" color="primary" />
                                </template>
                            </Qinput>
                        </div>
                    </div>

                    <div class="text-subtitle1 text-primary q-mt-md q-mb-sm">
                        {{ t('item.packageOptions') }}
                        <div class="text-caption text-grey-7">{{ t('item.packageStructureHint') }}</div>
                    </div>
                    <div class="row q-col-gutter-sm">
                        <!-- Package Units (the bigger unit) -->
                        <div class="col-12 col-md-6">
                            <Qinput
                                v-model.number="form.package_units"
                                :label="t('item.packageUnits')"
                                type="number"
                                :rules="[val => val === null || val === undefined || Number(val) >= 0 || t('item.negativeUnits')]"
                                outlined
                                class="enhanced-input"
                                :hint="t('item.packageUnitsHint')"
                            >
                                <template #before>
                                    <q-icon name="view_module" color="primary" />
                                </template>
                            </Qinput>
                        </div>

                        <!-- Packet Units (packets per package - the smaller unit) -->
                        <div class="col-12 col-md-6">
                            <Qinput
                                v-model.number="form.packet_units"
                                :label="t('item.packetUnits')"
                                type="number"
                                :rules="[val => val === null || val === undefined || Number(val) >= 0 || t('item.negativeUnits')]"
                                outlined
                                class="enhanced-input"
                                :hint="t('item.packetUnitsHint')"
                            >
                                <template #before>
                                    <q-icon name="view_comfy" color="primary" />
                                </template>
                            </Qinput>
                        </div>
                    </div>

                    <!-- Image Upload Section -->
                    <div class="text-subtitle1 text-primary q-mt-md q-mb-sm">
                        {{ t('item.image') }}
                    </div>
                    <div class="row q-col-gutter-sm">
                        <div class="col-12">
                            <q-file
                                v-model="imageFile"
                                :label="t('item.selectImage')"
                                accept="image/*"
                                outlined
                                class="enhanced-input"
                            >
                                <template #prepend>
                                    <q-icon name="image" color="primary" />
                                </template>
                            </q-file>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col">
                            <Qbtn
                                :btn-label="t('common.cancel')"
                                color="negative"
                                :is-flat="true"
                                :no-caps="true"
                                @click="model = false"
                                class="full-width"
                            />
                        </div>
                        <div class="col">
                            <Qbtn
                                type="submit"
                                :btn-label="t('item.addBtn')"
                                color="primary"
                                :is-rounded="false"
                                :no-caps="true"
                                :loading="loading"
                                class="full-width"
                            />
                        </div>
                    </div>
                </div>
            </q-form>
        </template>
    </QModalForm>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useItemStore } from 'src/stores/itemStore'
import { useItemCategoryStore } from 'src/stores/itemCategoryStore'
import { showNotify } from 'src/composables/Notify'
import type { AddItemPayload, ItemFormData } from 'src/types/item'

const emit = defineEmits(['item-added'])
const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const itemStore = useItemStore()
const itemCategoryStore = useItemCategoryStore()

const loading = ref(false)
const imageFile = ref<File|null>(null)

// Use categories from the store
const categoryOptions = computed(() =>
  itemCategoryStore.itemCategories.map(cat => ({ id: cat.id, name: cat.name }))
);

// Fetch categories if not loaded
onMounted(async () => {
  if (!itemCategoryStore.itemCategories.length) {
    await itemCategoryStore.fetchItemCategories();
  }
});

// Create the form using ItemFormData type for v-model compatibility
const form = reactive<ItemFormData>({
  sku: '',
  item_category_id: 0,
  name: '',
  description: '',
  weight_kg: 0,
  volume: 0,
  packet_units: 0,
  package_units: 0,
  min_qty: 0,
})

async function submitForm() {
    loading.value = true;
    try {
        let payload: FormData | AddItemPayload;

        if (imageFile.value) {
            const formData = new FormData();
            formData.append('image', imageFile.value);
            formData.append('sku', form.sku);
            formData.append('item_category_id', String(form.item_category_id || ''));
            formData.append('name', form.name);
            if (form.description) formData.append('description', form.description);
            if (form.weight_kg) formData.append('weight_kg', String(form.weight_kg));
            if (form.volume) formData.append('volume', String(form.volume));
            if (form.packet_units) formData.append('packet_units', String(form.packet_units));
            if (form.package_units) formData.append('package_units', String(form.package_units));
            formData.append('min_qty', String(form.min_qty || 0));

            payload = formData;
        } else {
            payload = {
                sku: form.sku,
                item_category_id: form.item_category_id || null,
                name: form.name,
                description: form.description || null,
                weight_kg: form.weight_kg || null,
                volume: form.volume || null,
                packet_units: form.packet_units || null,
                package_units: form.package_units || null,
                min_qty: form.min_qty || 0,
            };
        }

        const success = await itemStore.createItem(payload);
        if (success) {
            model.value = false;
            emit('item-added');
            showNotify({
                message: t('item.addSuccess'),
                type: 'positive'
            });
            // Reset form
            Object.assign(form, {
                sku: '',
                item_category_id: 0,
                name: '',
                description: '',
                weight_kg: 0,
                volume: 0,
                packet_units: 0,
                package_units: 0,
                min_qty: 0,
            });
            // Clear image
            imageFile.value = null;
        }
    } finally {
        loading.value = false;
    }
}
</script>

<style lang="scss" scoped>
.enhanced-input {
  margin-bottom: 12px;
}
</style>
