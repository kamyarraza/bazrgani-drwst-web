<template>
    <q-dialog v-model="isVisible" persistent maximized-mobile class="details-modal">
        <q-card class="details-modal-card">
            <q-card-section class="q-pb-none">
                <div class="row items-center">
                    <div class="col">
                        <div class="details-header">
                            <q-icon name="visibility" color="primary" size="2.5rem" class="q-mr-md" />
                            <div>
                                <div class="text-h6 text-weight-bold">{{ $t('pendingUpdate.updateRequestDetails') }}
                                </div>
                                <div class="text-caption text-grey-7">{{ $t('pendingUpdate.viewRequestInformation') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        <q-btn flat round dense icon="close" @click="closeModal" />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section v-if="pendingUpdate">
                <!-- Basic Information -->
                <div class="info-section q-mb-lg">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        {{ $t('pendingUpdate.basicInformation') }}
                    </div>

                    <q-card flat bordered class="info-card">
                        <q-card-section class="q-pa-md">
                            <div class="row q-col-gutter-md">
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.requestId') }}</div>
                                        <div class="info-value">#{{ pendingUpdate.id }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.requestedBy') }}</div>
                                        <div class="info-value">{{ pendingUpdate.user.name }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.updatableType') }}</div>
                                        <div class="info-value">
                                            <q-chip :color="getUpdatableTypeColor(pendingUpdate.updatable.type)"
                                                text-color="white" icon="category">
                                                {{ pendingUpdate.updatable.type }}
                                            </q-chip>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.updatableId') }}</div>
                                        <div class="info-value">#{{ pendingUpdate.updatable.id }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.status') }}</div>
                                        <div class="info-value">
                                            <q-chip :color="getStatusColor(pendingUpdate.status)" text-color="white"
                                                :icon="getStatusIcon(pendingUpdate.status)">
                                                {{ $t(`pendingUpdate.${pendingUpdate.status}`) }}
                                            </q-chip>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.requestedAt') }}</div>
                                        <div class="info-value">{{ pendingUpdate.created_human }}</div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>

                <!-- Requested Changes -->
                <div class="changes-section">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        {{ $t('pendingUpdate.requestedChanges') }}
                    </div>

                    <q-card flat bordered>
                        <q-card-section class="q-pa-md">
                            <div v-if="Object.keys(pendingUpdate.changes).length > 0" class="changes-list">
                                <div v-for="(value, key) in pendingUpdate.changes" :key="key"
                                    class="change-item q-mb-md">
                                    <div class="row items-center q-gutter-md">
                                        <div class="col-4">
                                            <div class="change-field">
                                                <q-icon name="edit" color="primary" class="q-mr-xs" />
                                                <strong>{{ formatFieldName(String(key)) }}</strong>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <q-icon name="arrow_forward" color="grey-5" class="q-mx-sm" />
                                        </div>
                                        <div class="col-6">
                                            <div class="change-value">
                                                <q-chip color="blue-1" text-color="blue-9" icon="new_releases">
                                                    {{ formatValue(value) }}
                                                </q-chip>
                                            </div>
                                        </div>
                                    </div>
                                    <q-separator
                                        v-if="Object.keys(pendingUpdate.changes).indexOf(String(key)) < Object.keys(pendingUpdate.changes).length - 1"
                                        class="q-mt-md" />
                                </div>
                            </div>
                            <div v-else class="text-grey-6 text-center q-pa-lg">
                                {{ $t('pendingUpdate.noChangesRequested') }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
                <q-btn flat :label="$t('common.close')" @click="closeModal" class="q-mr-sm" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PendingUpdate } from 'src/types/pendingUpdate';

// Props and emits
interface Props {
    modelValue: boolean;
    pendingUpdate: PendingUpdate | null;
}

interface Emits {
    (_e: 'update:modelValue', _value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const { t } = useI18n();

// Computed
const isVisible = computed({
    get: () => props.modelValue,
    set: (_value) => emit('update:modelValue', _value)
});

// Methods
function closeModal() {
    isVisible.value = false;
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'approved':
            return 'positive';
        case 'rejected':
            return 'negative';
        default:
            return 'grey';
    }
}

function getStatusIcon(status: string): string {
    switch (status) {
        case 'pending':
            return 'pending';
        case 'approved':
            return 'check_circle';
        case 'rejected':
            return 'cancel';
        default:
            return 'help';
    }
}

function getUpdatableTypeColor(type: string): string {
    switch (type.toLowerCase()) {
        case 'item':
            return 'blue';
        case 'customer':
            return 'green';
        case 'employee':
            return 'purple';
        case 'branch':
            return 'orange';
        default:
            return 'grey';
    }
}

function formatFieldName(key: string): string {
    // Convert snake_case to Title Case
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatValue(value: string | number | boolean): string {
    if (typeof value === 'boolean') {
        return value ? t('common.yes') : t('common.no');
    }
    return String(value);
}
</script>

<style lang="scss" scoped>
.details-modal-card {
    width: 100%;
    max-width: 800px;
    border-radius: 12px;
}

.details-header {
    display: flex;
    align-items: center;
}

.info-section {
    .info-card {
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

.changes-section {
    .change-item {
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .change-field {
            font-size: 0.95rem;
            color: #495057;
        }

        .change-value {
            display: flex;
            align-items: center;
        }
    }
}

// Mobile responsive adjustments
@media (max-width: 600px) {
    .details-modal-card {
        margin: 0;
        border-radius: 0;
        max-height: 100vh;
    }

    .info-item {
        margin-bottom: 1rem;
    }

    .change-item {
        .row {
            flex-direction: column;
            align-items: flex-start !important;

            .col {
                width: 100%;
                margin-bottom: 0.5rem;
            }
        }
    }
}
</style>
