<template>
  <div class="customer-selector q-pa-md">
    <div class="text-caption q-mb-xs">{{ t('transactionAlpha.selectCustomer') }} <span class="text-negative">*</span>
    </div>
    <q-input v-model="searchQuery" outlined clearable dense :loading="customerStore.loading" @focus="onFocus"
      @blur="onBlur" hide-bottom-space class="search-input" ref="inputRef"
      :hint="t('transactionAlpha.typeToSearchCustomers')">
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>
    <div v-if="errorMsg" class="text-negative q-mt-xs">{{ t('transactionAlpha.failedToFetchCustomers') }}</div>
    <!-- Customer Results List -->
    <div v-if="showResultsList" class="customer-results q-mt-sm">
      <q-card flat bordered class="results-card">
        <q-list separator class="results-list">
          <!-- Clear selection option when a customer is selected -->
          <q-item v-if="modelValue !== null && modelValue !== undefined" clickable v-ripple @click="clearSelection()"
            class="customer-item clear-item">
            <q-item-section avatar>
              <q-avatar color="grey-5" text-color="white" size="md">
                <q-icon name="clear" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="customer-name text-grey-6">
                {{ t('transactionAlpha.clearSelection') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-for="customer in customerOptions" :key="customer.id" clickable v-ripple
            @click="selectCustomer(customer)" class="customer-item" :class="{ 'selected': modelValue === customer.id }">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="md">
                {{ customer.name.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="customer-name">
                {{ customer.name }}
              </q-item-label>
              <q-item-label caption v-if="customer.location" class="customer-details">
                <q-icon name="location_on" size="xs" class="q-mr-xs" />
                {{ customer.location.name }}
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="modelValue === customer.id">
              <q-icon name="check_circle" color="positive" size="sm" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue';
import { QInput, QIcon, QItem, QItemSection, QAvatar, QCard, QList } from 'quasar';
import { useCustomerStore } from 'src/stores/customerStore';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  modelValue: { type: [Number, null], default: null },
  customerType: { type: String, default: 'customer' } // 'customer' or 'supplier'
});
const emit = defineEmits(['update:modelValue', 'select']);

const customerStore = useCustomerStore();

interface CustomerOption {
  id: number;
  name: string;
  location?: { name: string };
}

const selectedCustomerId = ref(props.modelValue);
const customerOptions = ref<CustomerOption[]>([]);
const searchQuery = ref('');
const inputRef = ref(null);
const isFocused = ref(false);
const errorMsg = ref('');
const isSelecting = ref(false);

const showResultsList = computed(() => isFocused.value && customerOptions.value.length > 0);

defineExpose({
  getOptions: () => customerOptions.value,
  selectCustomer
});

let searchTimeout: any = null;
watch(searchQuery, (val) => {
  if (isSelecting.value) {
    isSelecting.value = false;
    return;
  }
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const trimmed = (val || '').trim();
    void fetchCustomers(trimmed, props.customerType as 'customer' | 'supplier');
    if (trimmed === '') {
      emit('update:modelValue', null);
      emit('select', null);
    }
  }, 300); // Reduced delay for better UX
});

async function fetchCustomers(query = '', type = props.customerType as 'customer' | 'supplier') {
  errorMsg.value = '';
  try {
    const customers = await customerStore.searchCustomers(query, type);
    customerOptions.value = customers.map((c: any) => ({ id: c.id, name: c.fname && c.sname ? `${c.fname} ${c.sname}` : c.name, location: c.location }));
    // If a customer is already selected, update the search query to show its name
    if (props.modelValue !== null && props.modelValue !== undefined) {
      const selectedCustomer = customerOptions.value.find(c => c.id === props.modelValue);
      if (selectedCustomer && !isSelecting.value) {
        searchQuery.value = selectedCustomer.name;
      }
    }
  } catch {
    errorMsg.value = 'Failed to fetch customers.';
    customerOptions.value = [];
  }
}

function selectCustomer(customer: CustomerOption) {
  emit('update:modelValue', customer.id);
  emit('select', customer);
  isSelecting.value = true;
  searchQuery.value = customer.name;
  isFocused.value = false;
}

function clearSelection() {
  emit('update:modelValue', null);
  emit('select', null);
  isSelecting.value = true;
  searchQuery.value = '';
  isFocused.value = false;
}

function onFocus() {
  isFocused.value = true;
}
function onBlur() {
  setTimeout(() => { isFocused.value = false; }, 200);
}

onMounted(async () => {
  // Only fetch customers if we have a pre-selected value or if the user starts typing
  // This prevents auto-loading and auto-selecting on mount
  // if (props.modelValue !== null && props.modelValue !== undefined) {
    await fetchCustomers('', props.customerType as 'customer' | 'supplier');
  // }
});

watch(() => props.modelValue, (val) => {
  selectedCustomerId.value = val;
});
</script>

<style scoped>
.customer-selector {
  max-width: 340px;
  padding-top: 0;
}

.search-input {
  width: 100%;
  margin-top: 0;
}

.customer-item.selected {
  background: #e0f7fa;
}

.customer-item.clear-item {
  border-bottom: 1px solid #e0e0e0;
}

.customer-item.clear-item:hover {
  background: #f5f5f5;
}
</style>
