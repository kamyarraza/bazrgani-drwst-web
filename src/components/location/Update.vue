<template>
    <QModalForm
        v-model="model"
        :title="t('location.update', 'Update Location')"
        :show-user-info="true"
        :user-name="form.name"
        :default-user-name="t('location.locationDetails', 'Location Details')"
        :user-role="form.type || t('location.type', 'Location Type')">
        <template #default>
            <q-form @submit.prevent="submitForm">
                <div class="q-pa-md">
                    <!-- Form content in a two-column grid -->
                    <div class="row q-col-gutter-md">
                        <!-- Left Column -->
                        <div class="col-12 col-md-6">
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('location.basicInfo', 'Basic Information') }}</div>

                            <Qinput
                                v-model="form.name"
                                :label="t('location.name', 'Name')"
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
                                :label="t('location.type', 'Type')"
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
                            <div class="text-subtitle1 text-primary q-mb-sm">{{ t('location.additionalInfo', 'Additional Information') }}</div>

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
                                class="enhanced-input q-mt-md"
                                emit-value
                                map-options
                            >
                                <template #before>
                                    <q-icon name="schedule" color="primary" />
                                </template>
                            </q-select>

                            <div class="text-caption text-grey-7 q-mt-md">
                                {{ t('common.lastUpdated', 'Last Updated') }}: {{ formatDate(form.updated_at) }}
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="row justify-end q-mt-lg">
                        <q-btn
                            :label="t('common.cancel', 'Cancel')"
                            color="grey-7"
                            flat
                            class="q-mr-sm"
                            @click="model = false"
                        />
                        <q-btn
                            :label="t('common.save', 'Save')"
                            type="submit"
                            color="primary"
                        />
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
import type { Location } from 'src/types/Location';

const { t } = useI18n();
const model = defineModel<boolean>({ default: false });
const locationStore = useLocationStore();

const props = defineProps<{
    location?: Location
}>();

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
    id: 0,
    name: '',
    type: '',
    parent: {} as Record<string, unknown>,
    children: [] as string[],
    phone_code: '',
    timezone: '',
    created_at: '',
    updated_at: ''
});

// Watch for changes in the location prop
watch(() => props.location, (newLocation) => {
    if (newLocation) {
        form.id = newLocation.id;
        form.name = newLocation.name;
        form.type = newLocation.type;
        form.parent = newLocation.parent || {};
        form.children = newLocation.children || [];
        form.phone_code = newLocation.phone_code || '';
        form.timezone = newLocation.timezone || 'Asia/Baghdad'; // Default to Iraq/Baghdad if no timezone
        form.created_at = newLocation.created_at || '';
        form.updated_at = newLocation.updated_at || '';
    }
}, { immediate: true });

// Reset form when modal closes
watch(model, (newVal) => {
    if (!newVal && !props.location) {
        resetForm();
    }
});

function resetForm() {
    form.id = 0;
    form.name = '';
    form.type = '';
    form.parent = {};
    form.children = [];
    form.phone_code = '';
    form.timezone = 'Asia/Baghdad'; // Reset to default Iraq/Baghdad timezone
    form.created_at = '';
    form.updated_at = '';
}

async function submitForm() {
    if (!form.id) return;

    const success = await locationStore.updateLocation(form.id.toString(), form);
    if (success) {
        // Close modal
        model.value = false;
        // Emit success event
        emit('submit', { ...form });
    }
}

// Format date for display
function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
}
</script>

<style lang="scss" scoped>
.enhanced-input {
    margin-bottom: 1rem;
}
</style>
