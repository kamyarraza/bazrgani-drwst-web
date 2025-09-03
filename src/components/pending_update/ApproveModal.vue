<template>
    <q-dialog v-model="isVisible" persistent maximized-mobile class="approve-modal">
        <q-card class="approve-modal-card">
            <q-card-section class="q-pb-none">
                <div class="row items-center">
                    <div class="col">
                        <div class="approve-header">
                            <q-icon name="check_circle" color="positive" size="2.5rem" class="q-mr-md" />
                            <div>
                                <div class="text-h6 text-weight-bold">{{ $t('pendingUpdate.approveRequest') }}</div>
                                <div class="text-caption text-grey-7">{{ $t('pendingUpdate.confirmApprovalAction') }}
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

                <!-- Approval Confirmation -->
                <div class="approval-section">
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                        {{ $t('pendingUpdate.approvalConfirmation') }}
                    </div>

                    <q-card flat class="bg-positive text-white">
                        <q-card-section class="q-pa-md">
                            <div class="row items-center">
                                <q-icon name="info" size="1.5rem" class="q-mr-md" />
                                <div class="col">
                                    <div class="text-weight-medium q-mb-sm">{{ $t('pendingUpdate.approvalWarning') }}
                                    </div>
                                    <ul class="approval-warnings-list">
                                        <li>{{ $t('pendingUpdate.approvalWarning1') }}</li>
                                        <li>{{ $t('pendingUpdate.approvalWarning2') }}</li>
                                        <li>{{ $t('pendingUpdate.approvalWarning3') }}</li>
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
                <q-btn color="positive" :label="$t('pendingUpdate.approveNow')" icon="check_circle"
                    @click="handleApprove" :loading="loading" unelevated />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PendingUpdate } from 'src/types/pendingUpdate';
import { usePendingUpdateStore } from 'src/stores/pendingUpdateStore';

// Props and emits
interface Props {
    modelValue: boolean;
    pendingUpdate: PendingUpdate | null;
}

interface Emits {
    (_e: 'update:modelValue', _value: boolean): void;
    (_e: 'approved'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composables
const pendingUpdateStore = usePendingUpdateStore();

// State
const loading = ref(false);

// Computed
const isVisible = computed({
    get: () => props.modelValue,
    set: (_value) => emit('update:modelValue', _value)
});

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

async function handleApprove() {
    if (!props.pendingUpdate) return;

    loading.value = true;

    try {
        const success = await pendingUpdateStore.approvePendingUpdate(props.pendingUpdate.id);

        if (success) {
            emit('approved');
            closeModal();
        }
    } catch (error) {
        console.error('Error approving pending update:', error);
    } finally {
        loading.value = false;
    }
}
</script>

<style lang="scss" scoped>
.approve-modal-card {
    width: 100%;
    max-width: 600px;
    border-radius: 12px;
}

.approve-header {
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

.approval-section {
    .approval-warnings-list {
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
    .approve-modal-card {
        margin: 0;
        border-radius: 0;
        max-height: 100vh;
    }

    .info-item {
        margin-bottom: 1rem;
    }
}
</style>
