<template>
    <q-dialog v-model="isVisible" persistent maximized-mobile class="reject-modal">
        <q-card class="reject-modal-card">
            <q-card-section class="q-pb-none">
                <div class="row items-center">
                    <div class="col">
                        <div class="reject-header">
                            <q-icon name="cancel" color="negative" size="2.5rem" class="q-mr-md" />
                            <div>
                                <div class="text-h6 text-weight-bold">{{ $t('pendingUpdate.rejectRequest') }}</div>
                                <div class="text-caption text-grey-7">{{ $t('pendingUpdate.provideRejectionReason') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-auto">
                        <q-btn flat round dense icon="close" @click="closeModal" :disable="loading" />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section v-if="pendingUpdate">
                <!-- Request Information -->
                <div class="request-info-section q-mb-lg">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        {{ $t('pendingUpdate.requestInformation') }}
                    </div>

                    <q-card flat bordered class="request-info-card">
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
                                                text-color="white" icon="category" size="sm">
                                                {{ pendingUpdate.updatable.type }}
                                            </q-chip>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <div class="info-item">
                                        <div class="info-label">{{ $t('pendingUpdate.changesCount') }}</div>
                                        <div class="info-value">
                                            <q-badge color="primary"
                                                :label="Object.keys(pendingUpdate.changes).length" />
                                            {{ $t('pendingUpdate.fieldChanges') }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>

                <!-- Rejection Reason -->
                <div class="rejection-reason-section q-mb-lg">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        {{ $t('pendingUpdate.rejectionReason') }} <span class="text-negative">*</span>
                    </div>

                    <q-input v-model="rejectionReason" filled type="textarea" :maxlength="255"
                        :hint="$t('pendingUpdate.rejectionReasonPlaceholder')"
                        :error="!rejectionReason.trim() && showValidationError"
                        :error-message="$t('pendingUpdate.rejectionReasonRequired')"
                        input-style="border: 1px solid #ccc; border-radius: 7px; padding: 10px; resize: none;" />
                </div>

                <br>

                <!-- Rejection Warning -->
                <div class="rejection-warning-section">
                    <q-card flat class="bg-negative text-white">
                        <q-card-section class="q-pa-md">
                            <div class="row items-center">
                                <q-icon name="warning" size="1.5rem" class="q-mr-md" />
                                <div class="col">
                                    <div class="text-weight-medium q-mb-sm">{{ $t('pendingUpdate.rejectionWarning') }}
                                    </div>
                                    <ul class="rejection-warnings-list">
                                        <li>{{ $t('pendingUpdate.rejectionWarning1') }}</li>
                                        <li>{{ $t('pendingUpdate.rejectionWarning2') }}</li>
                                        <li>{{ $t('pendingUpdate.rejectionWarning3') }}</li>
                                    </ul>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
                <q-btn flat :label="$t('common.cancel')" @click="closeModal" :disable="loading" class="q-mr-sm" />
                <q-btn color="negative" :label="$t('pendingUpdate.rejectNow')" icon="cancel" @click="handleReject"
                    :loading="loading" :disable="!rejectionReason.trim()" unelevated />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PendingUpdate } from 'src/types/pendingUpdate';
import { usePendingUpdateStore } from 'src/stores/pendingUpdateStore';

// Props and emits
interface Props {
    modelValue: boolean;
    pendingUpdate: PendingUpdate | null;
}

interface Emits {
    (_e: 'update:modelValue', _value: boolean): void;
    (_e: 'rejected'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const pendingUpdateStore = usePendingUpdateStore();

// State
const loading = ref(false);
const rejectionReason = ref('');
const showValidationError = ref(false);

// Computed
const isVisible = computed({
    get: () => props.modelValue,
    set: (_value) => emit('update:modelValue', _value)
});

// Reset form when modal opens/closes
watch([isVisible, () => props.pendingUpdate], () => {
    rejectionReason.value = '';
    showValidationError.value = false;
}, { immediate: true });

// Methods
function closeModal() {
    if (!loading.value) {
        isVisible.value = false;
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

async function handleReject() {
    if (!props.pendingUpdate) return;

    // Validate rejection reason
    if (!rejectionReason.value.trim()) {
        showValidationError.value = true;
        return;
    }

    loading.value = true;

    try {
        const success = await pendingUpdateStore.rejectPendingUpdate(
            props.pendingUpdate.id,
            rejectionReason.value.trim()
        );

        if (success) {
            emit('rejected');
            closeModal();
        }
    } catch (error) {
        console.error('Error rejecting pending update:', error);
    } finally {
        loading.value = false;
    }
}
</script>

<style lang="scss" scoped>
.reject-modal-card {
    width: 100%;
    max-width: 600px;
    border-radius: 12px;
}

.reject-header {
    display: flex;
    align-items: center;
}

.request-info-section {
    .request-info-card {
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    }
}

.rejection-reason-section {
    :deep(.q-field__control) {
        min-height: 120px;
    }
}

.rejection-warning-section {
    .rejection-warnings-list {
        margin: 0;
        padding-left: 1.2rem;

        li {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            line-height: 1.4;
        }
    }
}

// Mobile responsive adjustments
@media (max-width: 600px) {
    .reject-modal-card {
        margin: 0;
        border-radius: 0;
        max-height: 100vh;
    }

    .info-item {
        margin-bottom: 1rem;
    }
}
</style>
