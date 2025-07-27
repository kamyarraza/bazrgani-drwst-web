<template>
  <q-page class="q-pa-md">
    <!-- Activity Logs Header Card -->
    <Header :title="t('logs.title', 'Activity Logs')"
      :subtitle="t('logs.subtitle', 'Track system activities and audit trails')" icon="history" icon-size="3rem"
      icon-color="white" :show-waves="true"
      background-color="linear-gradient(135deg, var(--q-primary) 0%, #1565c0 100%)" />
    <!-- Sticky Notes Overlay (absolute, not in normal flow) -->
    <div class="sticky-notes-overlay">
      <div v-for="(note, idx) in notes" :key="note.id" style="margin-bottom: 12px;">
        <Note :model-value="note" @update:model-value="val => { notes[idx] = { ...notes[idx], ...val } }"
          @close="removeNote(note.id)" />
      </div>
    </div>
    <!-- Filters Section -->
    <Filter v-model:filters="filters" :filter-options="filterOptions"
      :search-label="t('logs.searchLabel', 'Search by user, action, or entity')"
      :reset-label="t('logs.resetFilters', 'Reset')" @filter-change="handleFilterChange" @reset="resetFilters" />

    <!-- Activity Logs Table -->
    <QtableB show-bottom :top-right="false" :hasExpandableRows="false" :columns="columns" :rows="filteredData"
      :loading="logStore.loading" :menuItems="menuItems" :pagination="pagination" @page-change="handlePageChange">

    </QtableB>
  </q-page>
</template>

<script setup lang="ts">
import Header from 'src/components/common/Header.vue'
import QtableB from 'src/components/common/Qtable.vue'
import Filter, { type FilterState } from 'src/components/common/Filter.vue'
import Note from 'src/components/common/Note.vue'
import { useLogStore } from 'src/stores/logStore'
import { ref, computed, onMounted, reactive } from 'vue'

import { useI18n } from 'vue-i18n'
import type { AuditLogEntry } from 'src/types/log'

// Store and composables
const logStore = useLogStore()
const { t } = useI18n()

// Variables
const currentPage = ref(1)

// Computed values
const data = computed<AuditLogEntry[]>(() => logStore.logs)
const pagination = computed(() => logStore.pagination)

// Filter states
const filters = ref<FilterState>({
  search: ''
})

// Filter options for the Filter component
const filterOptions = computed(() => [
  {
    field: 'platform',
    label: t('logs.platform', 'Platform'),
    options: getUniquePlatforms(),
    icon: 'devices'
  }
])

// Menu items for row actions
const menuItems = computed(() => [
  { label: t('logs.viewDetails'), icon: 'visibility', value: 'view' }
])

// Table columns
const columns = computed(() => [
  {
    name: 'user',
    label: t('logs.columns.user', 'User'),
    align: 'left' as const,
    field: (row: Record<string, unknown>) => (row.user as any)?.name || '',
    format: (val: unknown, row: Record<string, unknown>) => {
      const user = row.user as any;
      return user ? `${user.name} (${user.username})` : '';
    },
    sortable: false
  },
  {
    name: 'title',
    label: t('logs.columns.action', 'Action'),
    align: 'left' as const,
    field: 'title',
    sortable: true
  },
  {
    name: 'platform',
    label: t('logs.columns.platform', 'Platform'),
    align: 'left' as const,
    field: 'platform',
    sortable: true
  },
  {
    name: 'ip_address',
    label: t('logs.columns.ipAddress', 'IP Address'),
    align: 'left' as const,
    field: 'ip_address',
    sortable: false
  },
  {
    name: 'created_at',
    label: t('logs.columns.timestamp', 'Timestamp'),
    align: 'left' as const,
    field: 'created_at',
    sortable: true
  },

])

// Filtered data based on search and filters
const filteredData = computed(() => {
  return data.value.filter(log => {
    // Search filter
    const searchMatch = !filters.value.search ||
      log.user.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      log.user.username.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      log.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      log.entity.toLowerCase().includes(filters.value.search.toLowerCase())

    return searchMatch
  })
})

// Methods
function getUniquePlatforms() {
  const platforms = new Set(data.value.map(log => log.platform))
  return Array.from(platforms).map(platform => ({
    label: platform,
    value: platform
  }))
}

function resetFilters() {
  filters.value = {
    search: ''
  }
}

function handleFilterChange(_newFilters: { search?: string; entity?: string | null; platform?: string | null }) {
  // intentionally left blank
}



// Notes state
const notes = reactive<Array<{ id: number; title: string; content: string }>>([])

function removeNote(id: number) {
  const idx = notes.findIndex(n => n.id === id)
  if (idx !== -1) notes.splice(idx, 1)
}

// Handle page change for pagination
async function handlePageChange(page: number) {
  currentPage.value = page
  await logStore.fetchLogs(page)

  // Scroll to top when changing pages for better UX
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Lifecycle hooks
onMounted(async () => {
  await logStore.fetchLogs()

  // Set current page from pagination if available
  if (logStore.pagination) {
    currentPage.value = logStore.pagination.current_page
  }
})
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

.bg-primary {
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 92, 170, 1) 100%) !important;
}

.text-h4 {
  font-size: 2.2rem;
  font-weight: 700;
}

.text-caption {
  opacity: 0.9;
}

:deep(.q-table) {
  border-radius: 8px;
}

:deep(.q-table th) {
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.03);
}

:deep(.q-table tbody tr:hover) {
  background-color: rgba(25, 118, 210, 0.05);
}

// Animation for statistics
@keyframes countUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.text-h2,
.text-h5.text-weight-bold.countup {
  font-size: 2rem !important;
  font-weight: 700;
  animation: countUp 0.5s ease-out forwards;
  margin-bottom: 0;
}

.q-card-section {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

// Sticky notes overlay style
.sticky-notes-overlay {
  position: fixed;
  top: 100px; // adjust as needed to be below header
  right: 32px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.sticky-notes-overlay>div {
  pointer-events: auto;
}

// Pagination styles
.q-pagination {
  margin-top: 16px;

  .q-btn {
    min-width: 36px;
    min-height: 36px;
    font-weight: 500;
    border-radius: 6px;
    margin: 0 3px;
    color: var(--q-primary);

    &.q-btn--active {
      background: var(--q-primary) !important;
      color: white !important;
      transform: scale(1.05);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }

    &:hover:not(.q-btn--active) {
      background: rgba(var(--q-primary-rgb), 0.1) !important;
    }
  }
}

// Log specific styles
.log-title {
  .q-chip {
    font-size: 0.75rem;
  }
}

.platform-info {
  display: flex;
  align-items: center;
}

.timestamp-info {
  text-align: left;
}

:deep(.q-table) {
  .q-td {
    padding: 12px 16px;
  }
}

:deep(.q-expansion-item__content) {
  padding: 0;
}
</style>
