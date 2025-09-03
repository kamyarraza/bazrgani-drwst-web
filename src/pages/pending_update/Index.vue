<template>
    <q-page class="q-pa-md">
        <!-- Check if user has permission -->
        <div v-if="!permissions.hasPermission('admin-section')" class="flex flex-center" style="min-height: 400px;">
            <q-card class="q-pa-xl text-center">
                <q-card-section>
                    <q-icon name="lock" size="4rem" color="negative" class="q-mb-md" />
                    <div class="text-h5 q-mb-md">{{ $t('admin.accessDenied') }}</div>
                    <div class="text-body1 text-grey-7">
                        {{ $t('admin.insufficientPermissions') }}
                    </div>
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn flat color="primary" :label="$t('admin.goBack')" @click="$router.push('/')" />
                </q-card-actions>
            </q-card>
        </div>

        <!-- Main content - only show if user has permission -->
        <template v-else>
            <!-- Pending Updates Dashboard Header -->
            <Header :title="$t('pendingUpdate.dashboardTitle')" :subtitle="$t('pendingUpdate.managingPendingUpdates')"
                icon="pending_actions" icon-size="3rem" icon-color="white" :show-waves="true"
                background-color="linear-gradient(135deg, var(--q-warning) 0%, #f57c00 100%)" />

            <!-- Status Filters -->
            <q-card class="q-mb-md">
                <q-card-section>
                    <div class="row items-center q-col-gutter-md">
                        <div class="col-12 col-md-auto">
                            <div class="text-h6">{{ $t('pendingUpdate.filterByStatus') }}</div>
                        </div>

                        <div class="col-12 col-md">
                            <div class="row q-gutter-sm">
                                <!-- Filter Chips -->
                                <q-chip :selected="statusFilters.pending" clickable @click="toggleFilter('pending')"
                                    color="warning" text-color="white" icon="hourglass_empty" class="filter-chip">
                                    {{ $t('pendingUpdate.pending') }}
                                </q-chip>

                                <q-chip :selected="statusFilters.approved" clickable @click="toggleFilter('approved')"
                                    color="positive" text-color="white" icon="check_circle" class="filter-chip">
                                    {{ $t('pendingUpdate.approved') }}
                                </q-chip>

                                <q-chip :selected="statusFilters.rejected" clickable @click="toggleFilter('rejected')"
                                    color="negative" text-color="white" icon="cancel" class="filter-chip">
                                    {{ $t('pendingUpdate.rejected') }}
                                </q-chip>
                            </div>
                        </div>

                        <div class="col-12 col-md-auto" v-if="hasActiveFilters">
                            <!-- Clear Filters Button -->
                            <q-btn flat icon="delete_sweep" :label="$t('pendingUpdate.clearFilters')" @click="clearFilters"
                                color="red-5" class="q-ml-sm" />
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Pending Updates Table -->
            <QtableB show-bottom :user-type="me?.type!" :allowed-types="['admin']" :hasExpandableRows="false"
                :columns="columns" :rows="pendingUpdates" :loading="pendingUpdateStore.loading" :pagination="pagination"
                :menuItems="menuItems" @menu-action="handleAction" @page-change="handlePageChange" />

            <!-- Details Modal -->
            <DetailsModal v-model="showDetailsModal" :pending-update="pendingUpdateToView" />

            <!-- Approve Modal -->
            <ApproveModal v-model="showApproveModal" :pending-update="pendingUpdateToApprove"
                @approved="handleApproved" />

            <!-- Reject Modal -->
            <RejectModal v-model="showRejectModal" :pending-update="pendingUpdateToReject" @rejected="handleRejected" />
        </template>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import QtableB from 'src/components/common/Qtable.vue';
import Header from 'src/components/common/Header.vue';
import DetailsModal from 'src/components/pending_update/DetailsModal.vue';
import ApproveModal from 'src/components/pending_update/ApproveModal.vue';
import RejectModal from 'src/components/pending_update/RejectModal.vue';
import { usePendingUpdateStore } from 'src/stores/pendingUpdateStore';
import { useMeStore } from 'src/stores/meStore';
import { usePermissions } from 'src/composables/usePermissions';
import type { PendingUpdate } from 'src/types/pendingUpdate';
import type { MenuItem } from 'src/types';

// Composables
const { t } = useI18n();
const pendingUpdateStore = usePendingUpdateStore();
const { me } = useMeStore();
const permissions = usePermissions();

// State
const showDetailsModal = ref(false);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const pendingUpdateToView = ref<PendingUpdate | null>(null);
const pendingUpdateToApprove = ref<PendingUpdate | null>(null);
const pendingUpdateToReject = ref<PendingUpdate | null>(null);
const currentPage = ref(1);

// Filter state
const statusFilters = ref({
    pending: false,
    approved: false,
    rejected: false
});

// Computed
const pendingUpdates = computed(() => pendingUpdateStore.pendingUpdates);
const pagination = computed(() => pendingUpdateStore.pagination);

// Check if any filters are active
const hasActiveFilters = computed(() => {
    return statusFilters.value.pending || statusFilters.value.approved || statusFilters.value.rejected;
});

// Table columns
const columns = [
    {
        name: 'id',
        label: t('pendingUpdate.id'),
        align: 'left' as const,
        field: 'id',
        sortable: true
    },
    {
        name: 'user',
        label: t('pendingUpdate.requestedBy'),
        align: 'left' as const,
        field: (row: PendingUpdate) => row.user.name,
        sortable: true
    },
    {
        name: 'updatable_type',
        label: t('pendingUpdate.entityType'),
        align: 'center' as const,
        field: (row: PendingUpdate) => row.updatable.type,
        sortable: true
    },
    {
        name: 'status',
        label: t('pendingUpdate.status'),
        align: 'center' as const,
        field: 'status',
        style: (row: PendingUpdate) => {
            switch (row.status) {
                case 'pending':
                    return 'color: orange; font-weight: bold; background-color: rgba(255, 193, 7, 0.1);';
                case 'approved':
                    return 'color: green; font-weight: bold; background-color: rgba(76, 175, 80, 0.1);';
                case 'rejected':
                    return 'color: red; font-weight: bold; background-color: rgba(255, 82, 82, 0.1);';
                default:
                    return '';
            }
        },
        sortable: true
    },
    {
        name: 'created_human',
        label: t('pendingUpdate.requestedAt'),
        align: 'center' as const,
        field: 'created_human',
        sortable: true
    },
    {
        name: 'actions',
        label: t('pendingUpdate.actions'),
        align: 'center' as const,
        field: 'actions',
        sortable: false
    }
];

// Menu items for row actions
const menuItems: MenuItem[] = [
    { label: t('pendingUpdate.viewDetails'), icon: 'visibility', value: 'view' },
    { label: t('pendingUpdate.approve'), icon: 'check_circle', value: 'approve' },
    { label: t('pendingUpdate.reject'), icon: 'cancel', value: 'reject' }
];

// Filter functions
function toggleFilter(status: 'pending' | 'approved' | 'rejected') {
    // Clear the previous filter
    clearFilters();
    // Toggle the selected filter
    statusFilters.value[status] = !statusFilters.value[status];
    // Apply the filter
    void applyFilters();
}

function clearFilters() {
    statusFilters.value = {
        pending: false,
        approved: false,
        rejected: false
    };
    void applyFilters();
}

async function applyFilters() {
    currentPage.value = 1; // Reset to first page when filtering
    const filters = {
        pending: statusFilters.value.pending || undefined,
        approved: statusFilters.value.approved || undefined,
        rejected: statusFilters.value.rejected || undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
    ) as { pending?: boolean; approved?: boolean; rejected?: boolean };

    await pendingUpdateStore.fetchPendingUpdates(1, cleanFilters);
}

// Find selected pending update by ID
function selectedPendingUpdate(id: number): PendingUpdate | undefined {
    return pendingUpdates.value.find((update) => update.id === id);
}

// Handle menu actions
function handleAction(payload: { item: MenuItem; rowId: number }) {
    const selectedAction = payload.item.value;
    const pendingUpdate = selectedPendingUpdate(payload.rowId);

    if (!pendingUpdate) return;

    switch (selectedAction) {
        case 'view':
            pendingUpdateToView.value = pendingUpdate;
            showDetailsModal.value = true;
            break;

        case 'approve':
            pendingUpdateToApprove.value = pendingUpdate;
            showApproveModal.value = true;
            break;

        case 'reject':
            pendingUpdateToReject.value = pendingUpdate;
            showRejectModal.value = true;
            break;
    }
}

// Handle page change for pagination
async function handlePageChange(page: number) {
    currentPage.value = page;

    // Use current filters when changing pages
    const filters = {
        pending: statusFilters.value.pending || undefined,
        approved: statusFilters.value.approved || undefined,
        rejected: statusFilters.value.rejected || undefined
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
    ) as { pending?: boolean; approved?: boolean; rejected?: boolean };

    await pendingUpdateStore.fetchPendingUpdates(page, cleanFilters);

    // Scroll to top when changing pages for better UX
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Handle successful approval
function handleApproved() {
    // The store already removes the item from the list
    // Just refresh to ensure consistency
    void pendingUpdateStore.refreshPendingUpdates();
}

// Handle successful rejection
function handleRejected() {
    // The store already removes the item from the list
    // Just refresh to ensure consistency
    void pendingUpdateStore.refreshPendingUpdates();
}

// Lifecycle
onMounted(async () => {
    await pendingUpdateStore.fetchPendingUpdates();

    // Set current page from pagination if available
    if (pendingUpdateStore.pagination) {
        currentPage.value = pendingUpdateStore.pagination.current_page;
    }
});
</script>

<style lang="scss" scoped>
.q-card {
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
}

:deep(.q-table) {
    border-radius: 8px;
}

:deep(.q-table th) {
    font-weight: 600;
    background-color: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tbody tr:hover) {
    background-color: rgba(255, 193, 7, 0.05);
}

// Filter chip styling
.filter-chip {
    transition: all 0.3s ease;

    &:not(.q-chip--selected) {
        opacity: 0.6;
        background-color: rgba(0, 0, 0, 0.12) !important;

        :deep(.q-chip__icon) {
            color: rgba(0, 0, 0, 0.6) !important;
        }

        :deep(.q-chip__content) {
            color: rgba(0, 0, 0, 0.6) !important;
        }
    }

    &:hover {
        opacity: 1;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
}
</style>
