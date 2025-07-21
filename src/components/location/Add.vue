<template>
    <QModalForm
        v-model="model"
        :title="t('location.addNew', 'Add New Location')"
        :show-user-info="true"
        :user-name="form.name"
        :default-user-name="t('location.newLocation', 'New Location')"
        :user-role="t('location.role', 'Location')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('location.info', 'Location Information') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('location.name', 'Location Name')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="place" color="primary" />
                                </template>
                            </Qinput>

                            <q-select
                                v-model="form.type"
                                :options="['country', 'state', 'city', 'district', 'area']"
                                :label="t('location.type', 'Location Type')"
                                :rules="[val => !!val || t('validation.required', 'This field is required')]"
                                outlined
                                class="enhanced-input q-mt-md"
                            >
                                <template #before>
                                    <q-icon name="category" color="primary" />
                                </template>
                            </q-select>
                        </div>

                        <!-- Right Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('location.details', 'Additional Details') }}</div>

                            <Qinput
                                v-model="form.phone_code"
                                :label="t('location.phoneCode', 'Phone Code')"
                                outlined
                                class="enhanced-input"
                            >
                                <template #before>
                                    <q-icon name="phone" color="primary" />
                                </template>
                            </Qinput>

                            <q-select
                                v-model="form.timezone"
                                :options="timezoneOptions"
                                :label="t('location.timezone', 'Timezone')"
                                outlined
                                class="enhanced-input"
                                emit-value
                                map-options
                            >
                                <template #before>
                                    <q-icon name="schedule" color="primary" />
                                </template>
                            </q-select>
                        </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="row q-col-gutter-md">
                        <div class="col">
                            <q-btn
                                :label="t('common.cancel', 'Cancel')"
                                color="negative"
                                flat
                                no-caps
                                @click="model = false"
                                class="full-width"
                            />
                        </div>
                        <div class="col">
                            <q-btn
                                type="submit"
                                :label="t('location.addBtn', 'Add Location')"
                                color="primary"
                                no-caps
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
import { reactive, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import QModalForm from 'src/components/common/QModalForm.vue';
import Qinput from 'src/components/common/Qinput.vue';
import { useLocationStore } from 'src/stores/locationStore';

const { t } = useI18n();
const model = defineModel<boolean>({ default: false });
const locationStore = useLocationStore();
const emit = defineEmits(['submit']);

// Timezone options
const timezoneOptions = ref([
    {
        label: 'Asia/Baghdad (Iraq)',
        value: 'Asia/Baghdad'
    }
]);

// Form structure matching the Location interface
const form = reactive({
    name: '',
    type: '',
    parent: {} as Record<string, unknown>,
    children: [] as string[],
    phone_code: '',
    timezone: 'Asia/Baghdad' // Default to Iraq/Baghdad
});

// Reset form when modal closes
watch(model, (newVal) => {
    if (!newVal) {
        resetForm()
    }
})

function resetForm() {
    form.name = ''
    form.type = ''
    form.parent = {}
    form.children = []
    form.phone_code = ''
    form.timezone = 'Asia/Baghdad' // Reset to default Iraq/Baghdad timezone
}

async function submitForm() {
    // Send the form object directly to the store
    const payload = {
        name: form.name,
        type: form.type,
        parent: form.parent,
        children: form.children,
        phone_code: form.phone_code,
        timezone: form.timezone
    }
    const success = await locationStore.createLocation(payload)
    if (success) {
        // Close modal
        model.value = false
        // Reset form
        resetForm()
        // Emit success event with the form data
        emit('submit', form)
    }
}

// Reset the form when the modal is closed
watch(model, (newVal) => {
    if (!newVal) {
        resetForm();
    }
});
</script>

<style lang="scss" scoped>
.enhanced-input {
    margin-bottom: 1rem;
}
</style>
