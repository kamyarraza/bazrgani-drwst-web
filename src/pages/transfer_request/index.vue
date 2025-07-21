<template>
  <q-page class="q-pa-md">
    <!-- Transfer Requests Dashboard Header Card -->
    <Header
      :title="t('transferRequest.title')"
      :subtitle="t('transferRequest.subtitle')"
      icon="swap_horizontal_circle"
      icon-size="3rem"
      icon-color="white"
      :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)"
    />

    <!-- Tab Panel for different views -->
    <div class="row items-center justify-between q-mb-md">
      <q-tabs v-model="activeTab" class="text-primary" align="left">
        <q-tab name="requests" icon="swap_horiz" :label="t('transferRequest.myRequests', 'My Requests')" />
        <q-tab name="incoming" icon="move_to_inbox" :label="t('transferRequest.incomingRequests', 'Incoming Requests')" />
      </q-tabs>

      <!-- Create Transfer Request/Transfer Buttons -->
      <div class="q-gutter-sm">
        <q-btn
          color="positive"
          icon="move_to_inbox"
          :label="t('transferRequest.createRequest')"
          @click="openTransferModal('request')"
          unelevated
        />
        <q-btn
          color="primary"
          icon="swap_horiz"
          :label="t('transferRequest.createTransfer')"
          @click="openTransferModal('transfer')"
          unelevated
        />
      </div>
    </div>

    <q-tab-panels v-model="activeTab" style="background-color: #f7f9fc;" animated keep-alive>
      <!-- My Transfer Requests Tab -->
      <q-tab-panel name="requests" >
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <div class="text-h6 q-mb-md">
              <q-icon name="swap_horiz" class="q-mr-sm" />
              {{ t('transferRequest.myRequestsTitle', 'Transfer Requests Sent') }}
            </div>

            <!-- Filters Section -->
            <Filter
              v-model:filters="requestFilters"
              :filter-options="requestFilterOptions"
              :search-label="t('transferRequest.searchRequests', 'Search requests by note or warehouse')"
              :reset-label="t('common.reset', 'Reset')"
              @filter-change="handleRequestFilterChange"
              @reset="resetRequestFilters"
            />

            <!-- Requests Table -->
            <QtableB
              :top-right="false"
              show-bottom
              :user-type="me?.type!"
              :allowed-types="['admin', 'employee']"
              :hasExpandableRows="false"
              @menu-action="handleRequestAction"
              :columns="requestColumns"
              :rows="filteredRequests"
              :loading="transferStore.loading"
              :menuItems="requestMenuItems"
              :pagination="transferStore.requestsPagination"
              @page-change="handleRequestPageChange"
            >
              <!-- Status column template -->
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
                    text-color="white"
                    size="sm"
                    :icon="getStatusIcon(props.value)"
                  >
                    {{ getStatusLabel(props.value) }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Note column template -->
              <template #body-cell-note="props">
                <q-td :props="props">
                  <div class="ellipsis" style="max-width: 200px;">
                    <q-tooltip v-if="props.value && props.value.length > 50" class="bg-indigo">
                      {{ props.value }}
                    </q-tooltip>
                    {{ props.value && props.value.length > 50 ? props.value.substring(0, 50) + '...' : (props.value || t('common.noNote', 'No note')) }}
                  </div>
                </q-td>
              </template>

              <!-- Expandable row content -->
              <template #body-row-expand="{ row }">
                <q-card v-if="row && row.details" flat class="q-ma-sm">
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-md">
                      <q-icon name="inventory" class="q-mr-xs" />
                      {{ t('transferRequest.itemDetails', 'Items to Transfer') }}
                    </div>
                    <q-list separator>
                      <q-item v-for="detail in row.details" :key="detail.id">
                        <q-item-section>
                          <q-item-label>{{ detail.item?.name || t('common.unknownItem', 'Unknown Item') }}</q-item-label>
                          <q-item-label caption>SKU: {{ detail.item?.sku || t('common.notAvailable', 'N/A') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-chip color="info" text-color="white" size="sm">
                            {{ detail.quantity }} {{ t('common.units', 'units') }}
                          </q-chip>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </template>
            </QtableB>
          </div>
        </div>
      </q-tab-panel>

      <!-- Incoming Transfer Requests Tab -->
      <q-tab-panel name="incoming">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <div class="text-h6 q-mb-md">
              <q-icon name="move_to_inbox" class="q-mr-sm" />
              {{ t('transferRequest.incomingRequestsTitle', 'Incoming Transfer Requests') }}
            </div>

            <!-- Filters Section -->
            <Filter
              v-model:filters="incomingFilters"
              :filter-options="incomingFilterOptions"
              :search-label="t('transferRequest.searchIncoming', 'Search incoming requests')"
              :reset-label="t('common.reset', 'Reset')"
              @filter-change="handleIncomingFilterChange"
              @reset="resetIncomingFilters"
            />

            <!-- Incoming Requests Table -->
            <QtableB
              show-bottom
              :top-right="false"
              :user-type="me?.type!"
              :allowed-types="['admin', 'employee']"
              :hasExpandableRows="false"
              @menu-action="handleIncomingAction"
              :columns="incomingColumns"
              :rows="filteredIncomingRequests"
              :loading="transferStore.loading"
              :menuItems="incomingMenuItems"
              :pagination="transferStore.incomingPagination"
              @page-change="handleIncomingPageChange"
            >
              <!-- Status column template -->
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.value)"
                    text-color="white"
                    size="sm"
                    :icon="getStatusIcon(props.value)"
                  >
                    {{ getStatusLabel(props.value) }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Note column template -->
              <template #body-cell-note="props">
                <q-td :props="props">
                  <div class="ellipsis" style="max-width: 200px;">
                    <q-tooltip v-if="props.value && props.value.length > 50" class="bg-indigo">
                      {{ props.value }}
                    </q-tooltip>
                    {{ props.value && props.value.length > 50 ? props.value.substring(0, 50) + '...' : (props.value || t('common.noNote', 'No note')) }}
                  </div>
                </q-td>
              </template>

              <!-- Expandable row content -->
              <template #body-row-expand="{ row }">
                <q-card v-if="row && row.details" flat class="q-ma-sm">
                  <q-card-section>
                    <div class="text-subtitle2 q-mb-md">
                      <q-icon name="inventory" class="q-mr-xs" />
                      {{ t('transferRequest.itemDetails', 'Items to Transfer') }}
                    </div>
                    <q-list separator>
                      <q-item v-for="detail in row.details" :key="detail.id">
                        <q-item-section>
                          <q-item-label>{{ detail.item?.name || t('common.unknownItem', 'Unknown Item') }}</q-item-label>
                          <q-item-label caption>SKU: {{ detail.item?.sku || t('common.notAvailable', 'N/A') }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-chip color="info" text-color="white" size="sm">
                            {{ detail.quantity }} {{ t('common.units', 'units') }}
                          </q-chip>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </template>
            </QtableB>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Transfer Request Modal -->
    <TransferRequestModal
      v-model="showTransferModal"
      :initial-transfer-type="transferModalType"
      @transfer-created="handleTransferCreated"
    />

    <!-- Transfer Request Details Modal -->
    <q-dialog
      v-model="showDetailsModal"
      class="transfer-details-dialog"
      :maximized="$q.screen.lt.md"
      :full-width="$q.screen.lt.md"
    >
      <q-card class="transfer-details-card">
        <!-- Beautiful Modal Header -->
        <div class="modal-header">
          <div class="text-h5">
            <q-icon name="swap_horizontal_circle" class="q-mr-sm" />
            {{ t('transferRequest.requestDetails', 'Transfer Request Details') }}
          </div>
          <q-btn
            icon="close"
            flat
            round
            v-close-popup
            size="sm"
          />
        </div>

        <q-card-section v-if="selectedRequest" class="q-pa-md">
          <!-- Transfer Summary -->
          <div class="transfer-summary q-mb-md">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="assignment" class="summary-icon text-primary" />
                  <div>
                    <div class="summary-label">{{ t('transferRequest.requestId', 'Request ID') }}</div>
                    <div class="summary-value">#{{ selectedRequest.id }}</div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="info" class="summary-icon text-blue" />
                  <div>
                    <div class="summary-label">{{ t('transferRequest.status', 'Status') }}</div>
                    <div class="summary-value">
                      <q-chip
                        :color="getStatusColor(selectedRequest.status)"
                        text-color="white"
                        size="sm"
                        :icon="getStatusIcon(selectedRequest.status)"
                      >
                        {{ getStatusLabel(selectedRequest.status) }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="schedule" class="summary-icon text-purple" />
                  <div>
                    <div class="summary-label">{{ t('common.createdAt', 'Created At') }}</div>
                    <div class="summary-value">{{ formatDate(selectedRequest.created_at) }}</div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="summary-item">
                  <q-icon name="note" class="summary-icon text-orange" />
                  <div>
                    <div class="summary-label">{{ t('transferRequest.note', 'Note') }}</div>
                    <div class="summary-value">{{ selectedRequest.note || t('common.noNote', 'No note') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Warehouse Information -->
          <div class="warehouse-section q-mb-md">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="warehouse" class="q-mr-sm" />
              {{ t('transferRequest.warehouseInfo', 'Warehouse Information') }}
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="warehouse-card source-warehouse">
                  <q-icon name="logout" class="warehouse-icon text-negative" />
                  <div class="warehouse-label">{{ t('transferRequest.fromWarehouse', 'From Warehouse') }}</div>
                  <div class="warehouse-value text-negative">{{ selectedRequest.source?.name || t('common.notAvailable', 'N/A') }}</div>
                  <div class="warehouse-subtitle">{{ t('transferRequest.source', 'Source') }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="warehouse-card target-warehouse">
                  <q-icon name="login" class="warehouse-icon text-positive" />
                  <div class="warehouse-label">{{ t('transferRequest.toWarehouse', 'To Warehouse') }}</div>
                  <div class="warehouse-value text-positive">{{ selectedRequest.target?.name || t('common.notAvailable', 'N/A') }}</div>
                  <div class="warehouse-subtitle">{{ t('transferRequest.destination', 'Destination') }}</div>
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Items Section -->
          <div class="items-section">
            <div class="text-subtitle1 text-weight-medium q-mb-md">
              <q-icon name="inventory" class="q-mr-sm" />
              {{ t('transferRequest.itemsToTransfer', 'Items to Transfer') }}
              <q-chip color="info" text-color="white" size="sm" class="q-ml-sm">
                {{ (selectedRequest.items?.length || selectedRequest.details?.length || 0) }} {{ t('common.items', 'items') }}
              </q-chip>
            </div>

            <div class="items-list" v-if="(selectedRequest.items && selectedRequest.items.length > 0) || (selectedRequest.details && selectedRequest.details.length > 0)">
              <div
                v-for="(requestItem, index) in (selectedRequest.items || selectedRequest.details)"
                :key="index"
                class="item-card"
              >
                <div class="item-avatar">
                  <q-avatar color="primary" text-color="white" size="48px">
                    <q-icon name="inventory_2" />
                  </q-avatar>
                </div>

                <div class="item-content">
                  <div class="item-name">
                    {{ requestItem.item?.name || `Item #${requestItem.item?.id || requestItem.item}` }}
                  </div>

                  <div class="item-details">
                    <div class="detail-row" v-if="requestItem.item?.sku">
                      <q-chip size="xs" color="grey-6" text-color="white" icon="qr_code" dense>
                        {{ t('transferRequest.sku', 'SKU') }}: {{ requestItem.item.sku }}
                      </q-chip>
                    </div>
                    <div class="detail-row">
                      <q-chip size="xs" color="blue-grey" text-color="white" icon="tag" dense>
                        {{ t('transferRequest.itemId', 'ID') }}: {{ requestItem.item?.id || requestItem.item }}
                      </q-chip>
                    </div>
                    <div class="detail-row" v-if="requestItem.item?.category">
                      <q-chip size="xs" color="teal" text-color="white" icon="category" dense>
                        {{ requestItem.item.category.name }}
                      </q-chip>
                    </div>
                  </div>

                  <div class="item-description" v-if="requestItem.item?.description">
                    <q-icon name="description" class="q-mr-xs text-grey-6" />
                    <span class="text-grey-7">{{ requestItem.item.description }}</span>
                  </div>
                </div>

                <div class="item-quantity">
                  <div class="quantity-value">{{ requestItem.quantity }}</div>
                  <div class="quantity-label">{{ t('common.units', 'units') }}</div>
                  <div class="unit-cost" v-if="requestItem.item?.unit_cost">
                    ${{ requestItem.item.unit_cost }} {{ t('common.perUnit', 'per unit') }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-items">
              <q-icon name="inventory" size="3rem" class="text-grey-4" />
              <div class="text-grey-6">{{ t('transferRequest.noItems', 'No items found') }}</div>
            </div>
          </div>
        </q-card-section>

        <!-- Modal Actions -->
        <q-card-actions class="modal-actions">
          <q-btn
            flat
            :label="t('common.close', 'Close')"
            color="grey-7"
            v-close-popup
            class="close-btn"
          />

          <!-- Action buttons based on status and user permissions -->
          <div class="action-buttons" v-if="selectedRequest && canPerformActions(selectedRequest)">
            <q-btn
              v-if="selectedRequest.status === 'pending' && activeTab === 'incoming'"
              unelevated
              :label="t('transferRequest.approve', 'Approve')"
              color="positive"
              icon="check_circle"
              @click="handleApproveFromModal"
              class="action-btn approve-btn"
            />
            <q-btn
              v-if="selectedRequest.status === 'approved' && activeTab === 'incoming'"
              unelevated
              :label="t('transferRequest.complete', 'Complete')"
              color="info"
              icon="done_all"
              @click="handleCompleteFromModal"
              class="action-btn complete-btn"
            />
            <q-btn
              v-if="selectedRequest.status === 'pending'"
              unelevated
              :label="t('transferRequest.reject', 'Reject')"
              color="negative"
              icon="cancel"
              @click="handleRejectFromModal"
              class="action-btn reject-btn"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar, date } from 'quasar';
import { useTransferRequestStore } from 'src/stores/transferRequestStore';
import { useMeStore } from 'src/stores/meStore';
import type { TransferRequest } from 'src/stores/transferRequestStore';
import Header from 'src/components/common/Header.vue';
import Filter from 'src/components/common/Filter.vue';
import QtableB from 'src/components/common/Qtable.vue';
import TransferRequestModal from 'src/components/transfer_request/TransferRequestModal.vue';

const { t } = useI18n();
const $q = useQuasar();
const transferStore = useTransferRequestStore();
const meStore = useMeStore();

// Get current user data
const me = computed(() => meStore.me);

// State
const activeTab = ref('requests');
const requestFilters = ref({});
const incomingFilters = ref({});
const showDetailsModal = ref(false);
const selectedRequest = ref<TransferRequest | null>(null);

// Transfer Modal State
const showTransferModal = ref(false);
const transferModalType = ref<'request' | 'transfer'>('request');

// Filter options
const requestFilterOptions = computed(() => [
  {
    label: t('transferRequest.status', 'Status'),
    field: 'status',
    key: 'status',
    type: 'select',
    options: [
      { label: t('transferRequest.pending', 'Pending'), value: 'pending' },
      { label: t('transferRequest.approved', 'Approved'), value: 'approved' },
      { label: t('transferRequest.completed', 'Completed'), value: 'completed' },
      { label: t('transferRequest.rejected', 'Rejected'), value: 'rejected' }
    ]
  }
]);

const incomingFilterOptions = computed(() => requestFilterOptions.value);

// Menu items
const requestMenuItems = [
  { label: t('common.view', 'View Details'), icon: 'visibility', value: 'view', condition: () => true },
  { label: t('transferRequest.reject', 'Reject'), icon: 'cancel', value: 'reject', condition: (row: TransferRequest) => row.status === 'pending' },
  { label: t('transferRequest.approve', 'Approve'), icon: 'check_circle', value: 'approve', condition: (row: TransferRequest) => row.status === 'pending' },
];

const incomingMenuItems = [
  { label: t('common.view', 'View Details'), icon: 'visibility', value: 'view', condition: () => true },
  { label: t('transferRequest.complete', 'Mark Complete'), icon: 'done_all', value: 'complete', condition: (row: TransferRequest) => row.status === 'approved' },
];

// Table columns
const requestColumns = [

  {
    name: 'note',
    required: true,
    label: t('transferRequest.note', 'Note'),
    align: 'left' as const,
    field: (row: any) => row.note || t('common.noNote', 'No note'),
    sortable: true,
  },
  {
    name: 'fromWarehouse',
    required: true,
    label: t('transferRequest.fromWarehouse', 'From Warehouse'),
    align: 'left' as const,
    field: (row: any) => row.source?.name || row.fromWarehouse?.name || t('common.notAvailable', 'N/A'),
    sortable: true,
  },
  {
    name: 'toWarehouse',
    required: true,
    label: t('transferRequest.toWarehouse', 'To Warehouse'),
    align: 'left' as const,
    field: (row: any) => row.target?.name || row.toWarehouse?.name || t('common.notAvailable', 'N/A'),
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: t('transferRequest.status', 'Status'),
    align: 'center' as const,
    field: 'status',
    sortable: true,
  },
  {
    name: 'created_at',
    required: true,
    label: t('common.createdAt', 'Created At'),
    align: 'left' as const,
    field: 'created_at',
    format: (val: unknown) => val ? date.formatDate(val as string, 'dddd, MMMM D, YYYY • h:mm A') : '',
    sortable: true,
  },
  {
    name: 'actions',
    required: true,
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

const incomingColumns = [

  {
    name: 'note',
    required: true,
    label: t('transferRequest.note', 'Note'),
    align: 'left' as const,
    field: (row: any) => row.note || t('common.noNote', 'No note'),
    sortable: true,
  },
  {
    name: 'fromWarehouse',
    required: true,
    label: t('transferRequest.fromWarehouse', 'From Warehouse'),
    align: 'left' as const,
    field: (row: any) => row.source?.name || row.fromWarehouse?.name || 'N/A',
    sortable: true,
  },
  {
    name: 'toWarehouse',
    required: true,
    label: t('transferRequest.toWarehouse', 'To Warehouse'),
    align: 'left' as const,
    field: (row: any) => row.target?.name || row.toWarehouse?.name || 'N/A',
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: t('transferRequest.status', 'Status'),
    align: 'center' as const,
    field: 'status',
    sortable: true,
  },
  {
    name: 'created_at',
    required: true,
    label: t('common.createdAt', 'Created At'),
    align: 'left' as const,
    field: 'created_at',
    format: (val: unknown) => val ? date.formatDate(val as string, 'dddd, MMMM D, YYYY • h:mm A') : '',
    sortable: true,
  },
  {
    name: 'actions',
    required: true,
    label: t('common.actions', 'Actions'),
    align: 'center' as const,
    field: 'actions',
    sortable: false,
  },
];

// Computed
const filteredRequests = computed(() => {
  let requests = transferStore.transferRequests;

  if (requestFilters.value && typeof requestFilters.value === 'object') {
    const filters = requestFilters.value as Record<string, any>;
    if (filters.status) {
      requests = requests.filter(req => req.status === filters.status);
    }
  }

  return requests;
});

const filteredIncomingRequests = computed(() => {
  let requests = transferStore.incomingTransfers;

  if (incomingFilters.value && typeof incomingFilters.value === 'object') {
    const filters = incomingFilters.value as Record<string, any>;
    if (filters.status) {
      requests = requests.filter(req => req.status === filters.status);
    }
  }

  return requests;
});

// No need for filteredTransfers as we removed the transfers tab

// Methods
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    approved: 'info',
    completed: 'positive',
    rejected: 'negative'
  };
  return colorMap[status] || 'grey';
};

const getStatusIcon = (status: string): string => {
  const iconMap: Record<string, string> = {
    pending: 'hourglass_empty',
    approved: 'check_circle',
    completed: 'done_all',
    rejected: 'cancel'
  };
  return iconMap[status] || 'help';
};

const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    pending: t('transferRequest.pending', 'Pending'),
    approved: t('transferRequest.approved', 'Approved'),
    completed: t('transferRequest.completed', 'Completed'),
    rejected: t('transferRequest.rejected', 'Rejected')
  };
  return labelMap[status] || status;
};

const handleRequestAction = (payload: { item: { value: string }, rowId: number }) => {
  const request = transferStore.transferRequests.find(r => r.id === payload.rowId);
  if (!request) return;

  switch (payload.item.value) {
    case 'view':
      showRequestDetails(request);
      break;
    case 'approve':
      handleApproveTransfer(request.id);
      break;
    case 'complete':
      handleCompleteTransfer(request.id);
      break;
    case 'reject':
      handleRejectTransfer(request.id);
      break;
    case 'edit':
      // TODO: Implement edit request
      break;
    case 'delete':
      // TODO: Implement delete request
      break;
  }
};

const handleIncomingAction = (payload: { item: { value: string }, rowId: number }) => {
  const request = transferStore.incomingTransfers.find(r => r.id === payload.rowId);
  if (!request) return;

  switch (payload.item.value) {
    case 'view':
      showRequestDetails(request);
      break;
    case 'approve':
      handleApproveTransfer(request.id);
      break;
    case 'complete':
      handleCompleteTransfer(request.id);
      break;
    case 'reject':
      handleRejectTransfer(request.id);
      break;
  }
};

// Removed handleTransferAction - not needed anymore

const handleApproveTransfer = (transferId: number) => {
  $q.dialog({
    title: t('transferRequest.confirmApprove', 'Confirm Approval'),
    message: t('transferRequest.confirmApproveMessage', 'Are you sure you want to approve this transfer request?'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    void transferStore.approveTransfer(transferId);
  });
};

const handleCompleteTransfer = (transferId: number) => {
  $q.dialog({
    title: t('transferRequest.confirmComplete', 'Confirm Completion'),
    message: t('transferRequest.confirmCompleteMessage', 'Are you sure you want to mark this transfer as completed?'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    void transferStore.completeTransfer(transferId);
  });
};

const handleRejectTransfer = (transferId: number) => {
  $q.dialog({
    title: t('transferRequest.confirmReject', 'Confirm Rejection'),
    message: t('transferRequest.confirmRejectMessage', 'Are you sure you want to reject this transfer request?'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    void transferStore.rejectTransfer(transferId);
  });
};

// Removed direct transfer handlers

const handleRequestFilterChange = () => {
  // Filter logic is handled in computed
};

const handleIncomingFilterChange = () => {
  // Filter logic is handled in computed
};

const resetRequestFilters = () => {
  requestFilters.value = {};
};

const resetIncomingFilters = () => {
  incomingFilters.value = {};
};

const handleRequestPageChange = (page: number) => {
  void transferStore.fetchTransferRequests(page);
};

const handleIncomingPageChange = (page: number) => {
  void transferStore.fetchIncomingTransfers(page);
};

// Removed handleTransferPageChange and handleCreateDirectTransfer

// Transfer Modal Methods
const openTransferModal = (type: 'request' | 'transfer') => {
  transferModalType.value = type;
  showTransferModal.value = true;
};

const handleTransferCreated = (_data: any) => {
  // Refresh the appropriate data
  void transferStore.fetchTransferRequests();
  void transferStore.fetchIncomingTransfers();

  // Show success message is handled in the modal
};

// Modal helper methods
const showRequestDetails = (request: TransferRequest) => {
  selectedRequest.value = request;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedRequest.value = null;
};

const formatDate = (dateString: string) => {
  return date.formatDate(dateString, 'dddd, MMMM D, YYYY • h:mm A');
};

const canPerformActions = (_request: TransferRequest) => {
  // Add your permission logic here
  // For example, check if user has permission to approve/reject
  return me.value?.type === 'admin' || me.value?.type === 'employee';
};

const handleApproveFromModal = () => {
  if (selectedRequest.value) {
    handleApproveTransfer(selectedRequest.value.id);
    closeDetailsModal();
  }
};

const handleCompleteFromModal = () => {
  if (selectedRequest.value) {
    handleCompleteTransfer(selectedRequest.value.id);
    closeDetailsModal();
  }
};

const handleRejectFromModal = () => {
  if (selectedRequest.value) {
    handleRejectTransfer(selectedRequest.value.id);
    closeDetailsModal();
  }
};

// Lifecycle
onMounted(async () => {
  // Ensure user data is loaded first
  if (!meStore.me) {
    await meStore.fetchMe();
  }

  // Load transfer requests data
  await Promise.all([
    transferStore.fetchTransferRequests(),
    transferStore.fetchIncomingTransfers()
  ]);
});
</script>

<style lang="scss" scoped>
.q-tab-panel {
  padding: 16px 0;
}

.status-chip {
  min-width: 80px;
}

:deep(.q-table) {
  .q-chip {
    min-width: 100px;
    justify-content: center;
  }

  // Improved table styles
  .q-td {
    padding: 12px 8px;
  }

  // Note column specific styles
  .ellipsis {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  // Status column styles
  .q-chip {
    font-weight: 500;
    text-transform: capitalize;
  }

  // Header styles
  .q-th {
    font-weight: 600;
    color: var(--q-primary);
  }
}

// Modal styles
:deep(.q-dialog) {
  .q-card {
    border-radius: 12px;
  }

  .bg-blue-1, .bg-green-1, .bg-orange-1 {
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .q-chip {
    font-weight: 500;
  }

  .q-item {
    border-radius: 6px;
    margin-bottom: 8px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  .q-avatar {
    border: 2px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  // Enhanced item display styles
  .q-list .q-item {
    padding: 16px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }

    .q-item-label {
      line-height: 1.4;
    }

    .q-chip {
      margin: 2px;
      font-size: 0.75rem;
    }
  }
}

// Transfer Details Dialog Styles
.transfer-details-dialog {
  :deep(.q-dialog__inner) {
    padding: 16px;
  }
}

.transfer-details-card {
  width: 100%;
  max-width: 1000px;
  min-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;

  .text-h5 {
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .q-btn {
    color: white;
  }
}

// Transfer Summary Section
.transfer-summary {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

.summary-icon {
  font-size: 28px;
  opacity: 0.8;
}

.summary-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--q-dark);
}

// Warehouse Section
.warehouse-section {
  background: rgba(var(--q-secondary-rgb), 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--q-secondary-rgb), 0.1);
}

.warehouse-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.source-warehouse {
    border-color: rgba(var(--q-negative-rgb), 0.2);
    background: linear-gradient(135deg, rgba(var(--q-negative-rgb), 0.05) 0%, white 100%);
  }

  &.target-warehouse {
    border-color: rgba(var(--q-positive-rgb), 0.2);
    background: linear-gradient(135deg, rgba(var(--q-positive-rgb), 0.05) 0%, white 100%);
  }
}

.warehouse-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.warehouse-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.warehouse-value {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.warehouse-subtitle {
  font-size: 14px;
  opacity: 0.6;
  font-style: italic;
}

// Items Section
.items-section {
  background: rgba(var(--q-accent-rgb), 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--q-accent-rgb), 0.1);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--q-primary);
  }
}

.item-avatar {
  .q-avatar {
    border: 3px solid rgba(var(--q-primary-rgb), 0.2);
    box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.2);
  }
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--q-dark);
  margin-bottom: 8px;
  line-height: 1.3;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;

  .q-chip {
    font-size: 11px;
    height: 22px;
  }
}

.item-description {
  font-size: 14px;
  color: var(--q-grey-7);
  font-style: italic;
  display: flex;
  align-items: center;
}

.item-quantity {
  text-align: center;
  min-width: 100px;
}

.quantity-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--q-primary);
  margin-bottom: 4px;
}

.quantity-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.unit-cost {
  font-size: 14px;
  color: var(--q-positive);
  font-weight: 600;
}

.empty-items {
  text-align: center;
  padding: 40px 20px;
  color: var(--q-grey-6);
}

// Modal Actions
.modal-actions {
  background: rgba(0, 0, 0, 0.02);
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.close-btn {
  color: var(--q-grey-7);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0.5px;

  &.approve-btn {
    background: linear-gradient(45deg, var(--q-positive), #43a047);
    box-shadow: 0 4px 12px rgba(var(--q-positive-rgb), 0.3);
  }

  &.complete-btn {
    background: linear-gradient(45deg, var(--q-info), #1e88e5);
    box-shadow: 0 4px 12px rgba(var(--q-info-rgb), 0.3);
  }

  &.reject-btn {
    background: linear-gradient(45deg, var(--q-negative), #e53935);
    box-shadow: 0 4px 12px rgba(var(--q-negative-rgb), 0.3);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
}

// Responsive improvements
@media (max-width: 768px) {
  :deep(.q-table) {
    .q-td, .q-th {
      padding: 8px 4px;
      font-size: 0.875rem;
    }
  }

  // Mobile Modal Styles
  .transfer-details-card {
    border-radius: 0;
    max-height: 100vh;

    .modal-header {
      padding: 16px 20px;
      border-radius: 0;

      .text-h5 {
        font-size: 1.2rem;
        line-height: 1.3;
      }
    }

    .q-card-section {
      padding: 16px;
    }

    // Make all columns full width on mobile
    .col-6 {
      width: 100% !important;
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }

    .summary-item, .warehouse-card {
      margin-bottom: 12px;
    }

    .item-card {
      flex-direction: column;
      text-align: center;
      gap: 12px;

      .item-content {
        order: 2;
      }

      .item-quantity {
        order: 3;
        min-width: auto;
      }

      .item-avatar {
        order: 1;
      }
    }

    .item-details {
      justify-content: center;
    }

    .modal-actions {
      flex-direction: column;
      gap: 12px;

      .action-buttons {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .transfer-details-dialog :deep(.q-dialog__inner) {
    padding: 0 !important;
  }
}

@media (max-width: 480px) {
  .transfer-details-card {
    font-size: 14px;

    .text-h5 {
      font-size: 1.1rem;
    }

    .summary-value, .warehouse-value {
      font-size: 14px;
    }

    .item-name {
      font-size: 16px;
    }

    .quantity-value {
      font-size: 20px;
    }

    .q-card-section {
      padding: 12px;
    }

    .modal-actions {
      padding: 16px;
    }
  }
}

// Tablet responsive styles
@media (min-width: 769px) and (max-width: 1024px) {
  .transfer-details-card {
    max-width: 90vw;
    width: 90vw;
  }
}

// Ensure dialog is properly positioned
.transfer-details-dialog .q-dialog__inner {
  padding: 0;
}

.transfer-details-dialog .q-dialog__inner--minimized {
  padding: 16px;
}

@media (max-width: 768px) {
  .transfer-details-dialog .q-dialog__inner--minimized {
    padding: 0 !important;
  }
}
</style>
