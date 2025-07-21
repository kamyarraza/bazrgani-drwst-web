<template>
  <div class="customer-selector q-pa-md">
    <div class="text-caption q-mb-xs">Select Customer <span class="text-negative">*</span></div>
    <q-input
      v-model="searchQuery"
      outlined
      clearable
      dense
      :loading="customerStore.loading"
      @focus="onFocus"
      @blur="onBlur"
      hide-bottom-space
      class="search-input"
      ref="inputRef"
      hint="Type to search customers"
    >
      <template v-slot:prepend>
        <q-icon name="person" />
      </template>
    </q-input>
    <div v-if="errorMsg" class="text-negative q-mt-xs">{{ errorMsg }}</div>
    <!-- Customer Results List -->
    <div v-if="showResultsList" class="customer-results q-mt-sm">
      <q-card flat bordered class="results-card">
        <q-list separator class="results-list">
          <q-item
            v-for="customer in customerOptions"
            :key="customer.id"
            clickable
            v-ripple
            @click="selectCustomer(customer)"
            class="customer-item"
            :class="{ 'selected': modelValue === customer.id }"
          >
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

const showResultsList = computed(() => isFocused.value && customerOptions.value.length > 0);

watch(searchQuery, (val) => {
  void fetchCustomers(val.trim(), props.customerType as 'customer' | 'supplier');
});

async function fetchCustomers(query = '', type = props.customerType as 'customer' | 'supplier') {
  errorMsg.value = '';
  try {
    const customers = await customerStore.searchCustomers(query, type);
    customerOptions.value = customers.map((c: any) => ({ id: c.id, name: c.fname && c.sname ? `${c.fname} ${c.sname}` : c.name, location: c.location }));
  } catch (err: any) {
    errorMsg.value = 'Failed to fetch customers.';
    customerOptions.value = [];
  }
}

function selectCustomer(customer: CustomerOption) {
  emit('update:modelValue', customer.id);
  emit('select', customer);
  searchQuery.value = customer.name;
  isFocused.value = false;
}

function onFocus() {
  isFocused.value = true;
}
function onBlur() {
  setTimeout(() => { isFocused.value = false; }, 200);
}

onMounted(async () => {
  await fetchCustomers('', props.customerType as 'customer' | 'supplier');
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
</style>
