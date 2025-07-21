<template>
  <div class="create-transfer-request">

    <!-- Removing direct transfer banner as we'll use a toggle instead -->

        <q-stepper
          v-model="currentStep"
          vertical
          color="primary"
          animated
          header-nav
          class="transfer-stepper"
        >
          <!-- Step 1: Select Transfer Type and Source Branch/Warehouse -->
          <q-step
            :name="1"
            :title="t('transferRequest.step1', 'Transfer Type & Source')"
            icon="settings"
            :done="currentStep > 1"
            :header-nav="currentStep > 1"
          >
            <div class="q-mb-md">
              <!-- Transfer Type Selection -->
              <div class="q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectTransferType', 'Select Transfer Type') }}
                </div>

                <q-card flat bordered>
                  <q-card-section>
                    <q-option-group
                      v-model="transferType"
                      :options="transferTypeOptions"
                      color="primary"
                    />
                    <q-item-label caption class="q-mt-sm">
                      {{ transferTypeDescription }}
                    </q-item-label>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Select Source Branch -->
              <div class="q-mb-md branch-select-container">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectFromBranch', 'Select source branch') }}
                </div>

                <q-select
                  v-model="transferStore.selectedFromBranch"
                  :options="fromBranchOptions"
                  option-label="name"
                  option-value="id"
                  :label="t('transferRequest.fromBranch', 'From Branch')"
                  outlined
                  map-options
                  emit-value
                  use-input
                  input-debounce="300"
                  @filter="filterFromBranches"
                  @focus="() => filterFromBranches('', (fn) => fn())"
                  :loading="branchStore.loading"
                  @update:model-value="onFromBranchChange"
                  behavior="menu"
                  class="branch-select"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.phone }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ t('common.noResults', 'No branches found') }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Select Source Warehouse -->
              <div class="q-mb-md" v-if="transferStore.selectedFromBranch">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectFromWarehouse', 'Select warehouse to transfer from') }}
                </div>

                <q-select
                  v-model="transferStore.selectedFromWarehouse"
                  :options="fromWarehouseOptions"
                  option-label="name"
                  option-value="id"
                  :label="t('transferRequest.fromWarehouse', 'From Warehouse')"
                  outlined
                  map-options
                  emit-value
                  use-input
                  input-debounce="300"
                  @filter="filterFromWarehouses"
                  @focus="() => filterFromWarehouses('', (fn) => fn())"
                  :loading="transferStore.loading"
                  @update:model-value="onFromWarehouseChange"
                  behavior="menu"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.address }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ t('common.noResults', 'No warehouses found') }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                :disable="!transferStore.selectedFromWarehouse"
                @click="currentStep = 2"
                color="primary"
                :label="t('common.continue', 'Continue')"
                icon-right="arrow_forward"
              />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 2: Select Destination Branch and Warehouse -->
          <q-step
            :name="2"
            :title="t('transferRequest.step2', 'Select Destination')"
            icon="place"
            :done="currentStep > 2"
            :header-nav="currentStep > 2"
          >
            <div class="q-mb-md">
              <!-- Select Branch -->
              <div class="q-mb-md branch-select-container">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectToBranch', 'Select destination branch') }}
                </div>

                <q-select
                  v-model="transferStore.selectedToBranch"
                  :options="toBranchOptions"
                  option-label="name"
                  option-value="id"
                  :label="t('transferRequest.toBranch', 'To Branch')"
                  outlined
                  map-options
                  emit-value
                  use-input
                  input-debounce="300"
                  @filter="filterToBranches"
                  @focus="() => filterToBranches('', (fn) => fn())"
                  :loading="branchStore.loading"
                  @update:model-value="onToBranchChange"
                  behavior="menu"
                  class="branch-select"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.phone }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ t('common.noResults', 'No branches found') }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Select Warehouse -->
              <div class="q-mb-md" v-if="transferStore.selectedToBranch">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectToWarehouse', 'Select destination warehouse') }}
                </div>

                <q-select
                  v-model="transferStore.selectedToWarehouse"
                  :options="toWarehouseOptions"
                  option-label="name"
                  option-value="id"
                  :label="t('transferRequest.toWarehouse', 'To Warehouse')"
                  outlined
                  map-options
                  emit-value
                  use-input
                  input-debounce="300"
                  @filter="filterToWarehouses"
                  @focus="() => filterToWarehouses('', (fn) => fn())"
                  :loading="transferStore.loading"
                  behavior="menu"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                        <q-item-label caption>{{ scope.opt.code }} • {{ scope.opt.address }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        {{ t('common.noResults', 'No warehouses found') }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                flat
                @click="currentStep = 1"
                color="primary"
                :label="t('common.back', 'Back')"
                icon="arrow_back"
                class="q-mr-sm"
              />
              <q-btn
                :disable="!transferStore.selectedToWarehouse"
                @click="currentStep = 3"
                color="primary"
                :label="t('common.continue', 'Continue')"
                icon-right="arrow_forward"
              />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 3: Select Items -->
          <q-step
            :name="3"
            :title="t('transferRequest.step3', 'Select Items')"
            icon="inventory_2"
            :done="currentStep > 3"
            :header-nav="currentStep > 3"
          >
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">
                {{ t('transferRequest.selectItems', 'Select items to transfer') }}
              </div>

              <!-- Item Selector Component -->
              <ItemSelector
                v-if="transferStore.selectedFromWarehouse"
                :key="`warehouse-${transferStore.selectedFromWarehouse}`"
                :warehouse-id="transferStore.selectedFromWarehouse"
                :selected-items="transferStore.selectedItems"
                @item-added="transferStore.addSelectedItem"
                @item-removed="transferStore.removeSelectedItem"
                @item-quantity-updated="transferStore.updateSelectedItemQuantity"
              />

              <!-- Selected Items Summary -->
              <div v-if="transferStore.selectedItems.length > 0" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.selectedItems', 'Selected Items') }} ({{ transferStore.totalItemsToTransfer }})
                </div>

                <q-card flat bordered>
                  <q-list separator>
                    <q-item v-for="item in transferStore.selectedItems" :key="item.item_id">
                      <q-item-section>
                        <q-item-label>{{ item.item.name }}</q-item-label>
                        <q-item-label caption v-if="item.item.sku">{{ t('common.sku') }}: {{ item.item.sku }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="row items-center q-gutter-sm">
                          <q-input
                            :model-value="item.quantity"
                            type="number"
                            min="1"
                            :max="transferStore.getItemAvailableQuantity(item.item)"
                            dense
                            outlined
                            style="width: 100px"
                            @update:model-value="(val) => transferStore.updateSelectedItemQuantityWithValidation(item.item_id, Number(val) || 1)"
                          >
                            <q-tooltip>
                              {{ t('transferRequest.maxAvailable', 'Max available') }}: {{ transferStore.getItemAvailableQuantity(item.item) }}
                            </q-tooltip>
                          </q-input>
                          <q-btn
                            flat
                            round
                            dense
                            icon="remove"
                            color="negative"
                            size="sm"
                            @click="transferStore.removeSelectedItem(item.item_id)"
                          />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>
            </div>

            <!-- Selection Summary -->
            <div v-if="transferStore.selectedItems.length > 0" class="q-mt-md q-mb-md">
              <q-card flat bordered class="bg-positive-1">
                <q-card-section class="q-pa-md">
                  <div class="row items-center">
                    <q-icon name="check_circle" color="positive" size="sm" class="q-mr-sm" />
                    <span class="text-positive text-weight-medium">
                      {{ transferStore.selectedItems.length }} {{ t('transferRequest.itemsSelected', 'item(s) selected') }}
                      • {{ t('transferRequest.totalQuantity', 'Total quantity') }}: {{ transferStore.totalItemsToTransfer }}
                    </span>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <q-stepper-navigation>
              <q-btn
                flat
                @click="currentStep = 2"
                color="primary"
                :label="t('common.back', 'Back')"
                icon="arrow_back"
                class="q-mr-sm"
              />
              <q-btn
                :disable="!canProceedToStep4"
                @click="currentStep = 4"
                color="primary"
                :label="t('common.continue', 'Continue')"
                icon-right="arrow_forward"
              >
                <q-tooltip v-if="!canProceedToStep4">
                  {{ t('transferRequest.selectItemsFirst', 'Please select at least one item to continue') }}
                </q-tooltip>
              </q-btn>
            </q-stepper-navigation>
          </q-step>

          <!-- Step 4: Add Note and Confirm -->
          <q-step
            :name="4"
            :title="t('transferRequest.step4', 'Add Note & Confirm')"
            icon="fact_check"
          >
            <div class="q-mb-md">
              <!-- Note Field -->
              <div class="q-mb-lg">
                <div class="text-subtitle2 q-mb-sm">
                  {{ t('transferRequest.addNote', 'Add a note') }} <span class="text-red">*</span>
                  <span class="text-caption text-grey-6">({{ t('transferRequest.required', 'Required') }})</span>
                </div>

                <q-input
                  v-model="transferStore.transferNote"
                  type="textarea"
                  :label="t('transferRequest.note', 'Transfer note')"
                  outlined
                  rows="3"
                  :placeholder="t('transferRequest.notePlaceholder', 'Add any additional information about this transfer...')"
                  :rules="[val => (val && val.trim().length > 0) || t('transferRequest.noteRequired', 'Note is required')]"
                  lazy-rules
                  :error="transferStore.transferNote.trim().length === 0"
                  :error-message="t('transferRequest.noteRequired', 'Note is required')"
                />
              </div>

              <!-- Transfer Summary -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">
                    <q-icon name="summarize" class="q-mr-sm" />
                    {{ t('transferRequest.transferSummary', 'Transfer Summary') }}
                  </div>

                  <div class="row q-col-gutter-md">
                    <!-- Transfer Type -->
                    <div class="col-12 q-mb-md">
                      <q-card flat bordered class="bg-grey-1">
                        <q-card-section class="q-pa-md">
                          <div class="text-subtitle2 q-mb-sm">
                            <q-icon name="settings" class="q-mr-sm" color="primary" />
                            {{ t('transferRequest.transferType', 'Transfer Type') }}
                          </div>
                          <q-chip
                            :color="transferType === 'direct' ? 'positive' : 'primary'"
                            text-color="white"
                            :icon="transferType === 'direct' ? 'flash_on' : 'pending'"
                          >
                            {{ transferType === 'direct'
                              ? t('transferRequest.directTransfer', 'Direct Transfer')
                              : t('transferRequest.regularRequest', 'Regular Request')
                            }}
                          </q-chip>
                          <div class="text-caption text-grey-7 q-mt-sm">
                            {{ transferTypeDescription }}
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Source & Destination -->
                    <div class="col-md-6 col-12">
                      <q-list>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="inventory" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ t('transferRequest.fromWarehouse', 'From Warehouse') }}</q-item-label>
                            <q-item-label caption>{{ selectedFromWarehouseObject?.name }}</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="place" color="secondary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ t('transferRequest.toWarehouse', 'To Warehouse') }}</q-item-label>
                            <q-item-label caption>{{ selectedToWarehouseObject?.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>

                    <!-- Items & Quantities -->
                    <div class="col-md-6 col-12">
                      <q-list>
                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="inventory_2" color="info" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ t('transferRequest.totalItems', 'Total Items') }}</q-item-label>
                            <q-item-label caption>{{ transferStore.selectedItems.length }} {{ t('transferRequest.itemTypes', 'item types') }}</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item>
                          <q-item-section avatar>
                            <q-icon name="functions" color="positive" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ t('transferRequest.totalQuantity', 'Total Quantity') }}</q-item-label>
                            <q-item-label caption>{{ transferStore.totalItemsToTransfer }} {{ t('common.units', 'units') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>

                  <!-- Selected Items Details -->
                  <div class="row q-mt-md" v-if="transferStore.selectedItems.length > 0">
                    <div class="col-12">
                      <q-expansion-item
                        icon="list"
                        :label="t('transferRequest.itemDetails', 'Item Details')"
                        header-class="text-primary"
                      >
                        <q-card flat bordered class="q-mt-sm">
                          <q-list separator>
                            <q-item
                              v-for="item in transferStore.selectedItems"
                              :key="item.item_id"
                              class="q-pa-sm"
                            >
                              <q-item-section avatar>
                                <q-avatar color="grey-3" text-color="grey-8" size="sm">
                                  <q-icon name="inventory_2" />
                                </q-avatar>
                              </q-item-section>
                              <q-item-section>
                                <q-item-label>{{ item.item.name }}</q-item-label>
                                <q-item-label caption v-if="item.item.sku">{{ t('common.sku') }}: {{ item.item.sku }}</q-item-label>
                              </q-item-section>
                              <q-item-section side>
                                <q-chip color="primary" text-color="white" size="sm">
                                  {{ item.quantity }} {{ t('transferRequest.units', 'units') }}
                                </q-chip>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-card>
                      </q-expansion-item>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Confirmation -->
              <q-card flat bordered class="bg-blue-1">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="text-subtitle2 text-primary">
                        <q-icon name="info" class="q-mr-sm" />
                        {{ t('transferRequest.confirmationMessage', 'Please review the details above and confirm to proceed') }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <q-stepper-navigation>
              <q-btn
                flat
                @click="currentStep = 3"
                color="primary"
                :label="t('common.back', 'Back')"
                icon="arrow_back"
                class="q-mr-sm"
              />
              <q-btn
                @click="submitTransferRequest"
                color="positive"
                :label="transferType === 'direct'
                  ? t('transferRequest.createDirectTransfer', 'Create Direct Transfer')
                  : t('transferRequest.createRequest', 'Create Request')"
                :icon="transferType === 'direct' ? 'flash_on' : 'move_to_inbox'"
                :loading="transferStore.loading"
                :disable="!transferStore.canCreateRequest"
                size="md"
                no-caps
              >
                <q-tooltip v-if="!transferStore.canCreateRequest">
                  <div v-if="transferStore.selectedItems.length === 0">
                    {{ t('transferRequest.selectItemsFirst', 'Please select at least one item') }}
                  </div>
                  <div v-else-if="transferStore.transferNote.trim().length === 0">
                    {{ t('transferRequest.noteRequired', 'Note is required') }}
                  </div>
                  <div v-else>
                    {{ t('transferRequest.fillAllFields', 'Please fill all required fields') }}
                  </div>
                </q-tooltip>
              </q-btn>
            </q-stepper-navigation>
          </q-step>
        </q-stepper>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { endPoints } from 'src/endpoint';
import { useTransferRequestStore } from 'src/stores/transferRequestStore';
import { useBranchStore } from 'src/stores/branchStore';
import { useMeStore } from 'src/stores/meStore';
import ItemSelector from 'src/components/transfer_request/ItemSelector.vue';

// Define emits
const emit = defineEmits<{
  'request-created': [];
}>();

// Reset function
const resetForm = () => {
  currentStep.value = 1;
  transferType.value = 'request';
  transferStore.resetForm();

  // Clear options
  fromBranchOptions.value = [];
  toBranchOptions.value = [];
  fromWarehouseOptions.value = [];
  toWarehouseOptions.value = [];
};

// Expose reset function for parent components
defineExpose({
  resetForm
});

const { t } = useI18n();
const $q = useQuasar();
const transferStore = useTransferRequestStore();
const branchStore = useBranchStore();
const meStore = useMeStore();

// State
const currentStep = ref(1);
const transferType = ref('request'); // 'request' or 'direct'

// Branch search options
const fromBranchOptions = ref<Array<{id: number, name: string, code: string, phone: string}>>([]);
const toBranchOptions = ref<Array<{id: number, name: string, code: string, phone: string}>>([]);

// Warehouse search options
const fromWarehouseOptions = ref<Array<{id: number, name: string, code: string, address: string}>>([]);
const toWarehouseOptions = ref<Array<{id: number, name: string, code: string, address: string}>>([]);

// Transfer type options
const transferTypeOptions = [
  {
    label: t('transferRequest.regularRequest', 'Regular Request'),
    value: 'request',
    description: t('transferRequest.regularRequestDesc', 'Requires approval from destination branch')
  },
  {
    label: t('transferRequest.directTransfer', 'Direct Transfer'),
    value: 'direct',
    description: t('transferRequest.directTransferDesc', 'Auto-approved, transfers immediately')
  }
];

const transferTypeDescription = computed(() => {
  if (transferType.value === 'direct') {
    return t('transferRequest.directTransferDesc', 'Direct transfer will be created and approved immediately, skipping the approval process.');
  } else {
    return t('transferRequest.regularRequestDesc', 'Transfer request will be created with pending status and requires approval from the destination branch.');
  }
});

// Computed
const selectedFromWarehouseObject = computed(() => {
  return fromWarehouseOptions.value.find(w => w.id === transferStore.selectedFromWarehouse);
});

const selectedToWarehouseObject = computed(() => {
  return toWarehouseOptions.value.find(w => w.id === transferStore.selectedToWarehouse);
});

// Computed to ensure reactivity for next button
const canProceedToStep4 = computed(() => {
  // Access the update counter to force reactivity
  const _ = transferStore.selectedItemsUpdateCounter;
  return transferStore.selectedItems.length > 0;
});

// Branch filter functions
async function filterFromBranches(val: string, update: (_fn: () => void) => void) {
  try {
    // If no search query, load initial branches
    const searchQuery = val.trim() || '';
    const searchResults = await branchStore.searchBranches(searchQuery);

    update(() => {
      fromBranchOptions.value = searchResults.map(branch => ({
        id: branch.id,
        name: branch.name,
        code: branch.code || '',
        phone: branch.phone
      }));
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    update(() => {
      fromBranchOptions.value = [];
    });
  }
}

async function filterToBranches(val: string, update: (_fn: () => void) => void) {
  try {
    // If no search query, load initial branches
    const searchQuery = val.trim() || '';
    const searchResults = await branchStore.searchBranches(searchQuery);

    update(() => {
      // Allow selecting the same branch as "from branch" - removed the filter
      toBranchOptions.value = searchResults.map(branch => ({
        id: branch.id,
        name: branch.name,
        code: branch.code || '',
        phone: branch.phone
      }));
    });
  } catch (error) {
    console.error('Error searching branches:', error);
    update(() => {
      toBranchOptions.value = [];
    });
  }
}

// Warehouse filter functions
async function filterFromWarehouses(val: string, update: (_fn: () => void) => void) {
  if (!transferStore.selectedFromBranch) {
    update(() => {
      fromWarehouseOptions.value = [];
    });
    return;
  }

  try {
    // If no search query, still search with empty string to get all warehouses
    const searchQuery = val.trim() || '';
    const searchResults = await searchWarehouses(transferStore.selectedFromBranch, searchQuery);

    update(() => {
      fromWarehouseOptions.value = searchResults.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || ''
      }));
    });
  } catch (error) {
    console.error('Error searching warehouses:', error);
    update(() => {
      fromWarehouseOptions.value = [];
    });
  }
}

async function filterToWarehouses(val: string, update: (_fn: () => void) => void) {
  if (!transferStore.selectedToBranch) {
    update(() => {
      toWarehouseOptions.value = [];
    });
    return;
  }

  try {
    // If no search query, still search with empty string to get all warehouses
    const searchQuery = val.trim() || '';
    const searchResults = await searchWarehouses(transferStore.selectedToBranch, searchQuery);

    update(() => {
      toWarehouseOptions.value = searchResults.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || ''
      }));
    });
  } catch (error) {
    console.error('Error searching warehouses:', error);
    update(() => {
      toWarehouseOptions.value = [];
    });
  }
}

// Helper function to search warehouses for a specific branch
async function searchWarehouses(branchId: number, query: string) {
  try {
    const searchParam = query ? `?query=${encodeURIComponent(query)}` : '';
    const response = await api.get(`${endPoints.branchWarehouses(branchId)}${searchParam}`);

    if (response.data.status === 'success') {
      return response.data.data.warehouses || [];
    }
    return [];
  } catch (error) {
    console.error('Error searching warehouses:', error);
    return [];
  }
}

// Methods
const onFromBranchChange = (_branchId: number) => {
  // Reset subsequent selections when from branch changes
  transferStore.selectedFromWarehouse = null;
  transferStore.selectedToBranch = null;
  transferStore.selectedToWarehouse = null;
  transferStore.selectedItems = [];

  // Clear warehouse options
  fromWarehouseOptions.value = [];
  toWarehouseOptions.value = [];
};

const onFromWarehouseChange = () => {
  // Reset subsequent selections when from warehouse changes
  transferStore.selectedToBranch = null;
  transferStore.selectedToWarehouse = null;
  transferStore.selectedItems = [];

  // Clear destination warehouse options
  toWarehouseOptions.value = [];
};

const onToBranchChange = (_branchId: number) => {
  // Reset warehouse selection when branch changes
  transferStore.selectedToWarehouse = null;

  // Clear destination warehouse options
  toWarehouseOptions.value = [];
};

const submitTransferRequest = async () => {
  if (!transferStore.canCreateRequest) {
    $q.notify({
      type: 'negative',
      message: t('transferRequest.invalidRequest', 'Please complete all required fields'),
      position: 'top'
    });
    return;
  }

  // Prepare transfer data
  const transferData = {
    from_warehouse_id: transferStore.selectedFromWarehouse!,
    to_warehouse_id: transferStore.selectedToWarehouse!,
    note: transferStore.transferNote,
    details: transferStore.selectedItems.map(item => ({
      item_id: item.item_id,
      quantity: item.quantity
    }))
  };

  // Determine whether to create a direct transfer or a request
  let success: boolean;

  if (transferType.value === 'direct') {
    // Create direct transfer (skips approval process)
    success = await transferStore.createTransfer(transferData);

    if (success) {
      // Reset form completely
      resetForm();

      // Emit event to parent
      emit('request-created');

      $q.notify({
        type: 'positive',
        message: t('transferRequest.directTransferCreated', 'Direct transfer created successfully'),
        position: 'top'
      });
    }
  } else {
    // Create regular transfer request
    success = await transferStore.createTransferRequest(transferData);

    if (success) {
      // Reset form completely
      resetForm();

      // Emit event to parent
      emit('request-created');

      $q.notify({
        type: 'positive',
        message: t('transferRequest.requestCreated', 'Transfer request created successfully'),
        position: 'top'
      });
    }
  }
};

// Lifecycle
onMounted(async () => {
  // Ensure user data is loaded
  if (!meStore.me) {
    await meStore.fetchMe();
  }

  // Load branches data for reference
  await transferStore.ensureBranchesLoaded();

  // Reset transfer type and store mode
  transferType.value = 'request';
  transferStore.isDirectTransferMode = false;
});
</script>

<style lang="scss" scoped>
.create-transfer-request {
  max-width: 800px;
  margin: 0 auto;
}

.transfer-stepper {
  .q-stepper__step-content {
    padding: 24px 16px;
    overflow: visible;
  }

  .q-stepper__nav {
    padding: 16px;
  }
}

:deep(.q-stepper__step-inner) {
  .q-stepper__title {
    font-weight: 600;
  }
}

.item-summary {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.direct-transfer-banner {
  .q-banner {
    background-color: var(--q-info);
    color: white;
    border-radius: 8px;
    padding: 16px;
  }
}

.branch-select-container {
  position: relative;
  overflow: visible;
}

.branch-select {
  position: relative;

  :deep(.q-menu) {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    transform: none !important;
    z-index: 2000 !important;
  }

  :deep(.q-select__dropdown) {
    position: absolute !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 2000 !important;
  }
}
</style>
