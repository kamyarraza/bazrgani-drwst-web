<template>
  <div class="branch-selector q-pa-md">
    <div class="text-caption q-mb-xs">{{ t('transactionAlpha.selectBranch') }} <span class="text-negative">*</span></div>
    <q-input
      v-model="searchQuery"
      outlined
      clearable
      dense
      :loading="branchStore.loading"
      @focus="onFocus"
      @blur="onBlur"
      hide-bottom-space
      class="branch-input"
      ref="inputRef"
      :disable="isEmployee"
      :hint="t('transactionAlpha.typeToSearchBranches')"
    >
      <template v-slot:prepend>
        <q-icon name="business" />
      </template>
    </q-input>

    <!-- Branch Results List -->
    <div v-if="showResultsList" class="branch-results q-mt-sm">
      <q-card flat bordered class="results-card">
        <q-list separator class="results-list">
          <q-item
            v-for="branch in branchOptions"
            :key="branch.id"
            clickable
            v-ripple
            @click="selectBranch(branch)"
            class="branch-item"
            :class="{ 'selected': modelValue === branch.id }"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="md">
                {{ branch.name.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="branch-name">
                {{ branch.name }}
              </q-item-label>
              <q-item-label caption v-if="branch.code || branch.phone" class="branch-details">
                <span v-if="'code' in branch && branch.code">{{ branch.code ?? '' }}</span>
                <span v-if="'code' in branch && branch.code && 'phone' in branch && branch.phone"> • </span>
                <span v-if="'phone' in branch && branch.phone">{{ branch.phone ?? '' }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="modelValue === branch.id">
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
import { useBranchStore } from 'src/stores/branchStore';
import { useAuthStore } from 'src/stores/authStore';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
  modelValue: { type: [Number, null], default: null }
});
const emit = defineEmits(['update:modelValue', 'select']);

const branchStore = useBranchStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.currentUser?.type === 'admin');
const isEmployee = computed(() => !isAdmin.value);

interface BranchOption {
  id: number;
  name: string;
  code?: string;
  phone?: string;
}

const selectedBranchId = ref(props.modelValue);
const branchOptions = ref<BranchOption[]>([]);
const searchQuery = ref('');
const inputRef = ref(null);
const isFocused = ref(false);

const showResultsList = computed(() => isFocused.value && branchOptions.value.length > 0);

async function fetchBranches(query = '') {
  const branches = await branchStore.searchBranches(query);
  branchOptions.value = branches.map((b: any) => ({ id: b.id, name: b.name, code: b.code ? b.code : '', phone: b.phone ? b.phone : '' }));
}

function selectBranch(branch: BranchOption) {
  emit('update:modelValue', branch.id);
  emit('select', branch);
  searchQuery.value = branch.name;
  isFocused.value = false;
}

// Debounce utility
let searchTimeout: any = null;
watch(searchQuery, (val) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    void fetchBranches((val || '').trim());
  }, 1000);
});

function onFocus() {
  isFocused.value = true;
}
function onBlur() {
  setTimeout(() => { isFocused.value = false; }, 200);
}

onMounted(async () => {
  if (isAdmin.value) {
    await fetchBranches('');
  } else if (isEmployee.value && authStore.currentUser?.branch) {
    const branch = authStore.currentUser.branch as BranchOption;
    selectedBranchId.value = branch.id;
    branchOptions.value = [{ id: branch.id, name: branch.name, code: branch.code ? branch.code : '', phone: branch.phone ? branch.phone : '' }];
    emit('update:modelValue', branch.id);
    emit('select', branch);
    searchQuery.value = branch.name;
  }
});

watch(() => props.modelValue, (val) => {
  selectedBranchId.value = val;
});
</script>

<style scoped>
.branch-selector {
  max-width: 340px;
  padding-top: 0;
}
.branch-input {
  width: 100%;
  margin-top: 0;
}
.branch-item.selected {
  background: #e0f7fa;
}
</style>
