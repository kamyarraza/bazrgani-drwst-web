<template>
    <QModalForm
        v-model="model"
        :title="t('branch.addNew', 'Add New Branch')"
        :show-user-info="false">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('branch.basicInfo', 'Basic Information') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('branch.name', 'Branch Name')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="store" color="primary" />
                                </template>
                            </Qinput>

                            <Qinput
                                v-model="form.code"
                                :label="t('branch.code', 'Branch Code')"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="code" color="primary" />
                                </template>
                            </Qinput>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('branch.contactInfo', 'Contact Information') }}</div>

                            <q-select
                                v-model="form.location_id"
                                :options="[{ label: t('branch.selectLocation', 'Please select location'), value: null, disable: true }, ...locationStore.locations.map(loc => ({ label: loc.name, value: loc.id }))]"
                                :label="t('branch.locationId', 'Location')"

                                :rules="[val => val !== null && val !== undefined || t('branch.locationRequired', 'Location is required for branch creation')]"
                                outlined
                                class="enhanced-input"
                                emit-value
                                map-options
                                clearable
                            >
                                <template #before>
                                    <q-icon name="location_on" color="primary" />
                                </template>
                            </q-select>

                            <Qinput
                                v-model="form.phone"
                                :label="t('branch.phone', 'Phone Number')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <div class="q-mt-md">
                                <q-checkbox
                                    v-model="form.is_active"
                                    :label="t('branch.active', 'Active')"
                                    color="primary"
                                />
                            </div>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col">
                            <Qbtn
                                :btn-label="t('common.cancel', 'Cancel')"
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
                                :btn-label="t('branch.addBtn', 'Add Branch')"
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
import { reactive, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Qinput from 'src/components/common/Qinput.vue'
import Qbtn from 'src/components/common/Qbtn.vue'
import QModalForm from 'src/components/common/QModalForm.vue'
import { useBranchStore } from 'src/stores/branchStore'
import { useLocationStore } from 'src/stores/locationStore'
import type { BranchFormData, BranchUpdatePayload, Branch } from 'src/types/branch'

const { t } = useI18n()
const model = defineModel<boolean>({ default: false })
const branchStore = useBranchStore()
const locationStore = useLocationStore()
const loading = computed(() => branchStore.loading)
const emit = defineEmits(['submit'])

// Form structure matching the Branch interface
const form = reactive<BranchFormData>({
    name: '',
    code: '',
    location_id: null,
    phone: '',
    is_active: true
})

// Fetch locations on mount if empty
onMounted(async () => {
    if (!locationStore.locations.length) {
        await locationStore.fetchLocations()
    }
})

// Reset form when modal closes
watch(model, (newVal) => {
    if (!newVal) {
        resetForm()
    }
})

function resetForm() {
    form.name = ''
    form.code = ''
    form.location_id = null
    form.phone = ''
    form.is_active = true
}

async function submitForm() {
    // Convert form data to payload, handling optional code field
    const payload: BranchUpdatePayload = {
        name: form.name,
        location_id: form.location_id as number, // Cast since validation ensures it's not null
        phone: form.phone,
        is_active: form.is_active,
        ...(form.code.trim() && { code: form.code.trim() })
    }

    const success = await branchStore.createBranch(payload as Partial<Branch>)
    if (success) {
        // Close modal
        model.value = false
        // Reset form
        resetForm()
        // Emit success event with the form data
        emit('submit', form)
    }
}
</script>
