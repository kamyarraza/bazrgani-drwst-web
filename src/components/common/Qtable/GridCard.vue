<template>
  <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 q-pa-sm">
    <q-card class="grid-card cursor-pointer transition-all" @click="emit('card-click')"
      :class="{ 'selected-card': isSelected, 'mobile-grid-card': isMobile }">
      <q-card-section :class="isMobile ? 'q-pa-sm' : 'q-pa-md'">
        <!-- Card Header with Image or Icon -->
        <div class="grid-card-header q-mb-md" :class="isMobile ? 'mobile-grid-card-header' : ''">
          <div class="flex items-center justify-between" :class="isMobile ? 'mobile-header-row' : ''">
            <div class="flex items-center flex-grow" :class="isMobile ? 'mobile-header-main' : ''">
              <q-avatar v-if="hasImage" :size="isMobile ? '36px' : '48px'" class="q-mr-sm grid-avatar">
                <img v-if="imageUrl" :src="imageUrl" :alt="primaryText" />
                <q-icon v-else name="image" :size="isMobile ? '20px' : '28px'" color="grey-5" />
              </q-avatar>
              <q-icon v-else :name="cardIcon" :size="isMobile ? '36px' : '48px'" color="primary"
                class="q-mr-sm grid-avatar" />
              <div class="grid-card-title flex-grow">
                <div class="text-h6 text-primary ellipsis grid-title"
                  :class="isMobile ? 'mobile-title' : ''">{{ primaryText }}</div>
                <div class="text-caption text-grey-6 grid-description"
                  :class="isMobile ? 'mobile-description' : ''">{{ secondaryText }}</div>
              </div>
              <q-badge color="primary" class="q-ml-sm grid-badge" v-if="showBadge">
                {{ badgeValue }}
              </q-badge>
            </div>
            <!-- Enhanced Actions Menu -->
            <div class="grid-actions-container" :class="isMobile ? 'mobile-actions' : ''">
              <q-btn flat round icon="more_vert" :size="isMobile ? 'lg' : 'md'" class="grid-actions-btn"
                @click.stop="emit('action-click')">
                <MenuDropdown @hide-menu="emit('hide-menu')" :menu-items="normalizedMenuItems"
                  v-bind="extraItem ? { extraItem } : {}" :min-width="'160px'" :has-separator="true"
                  @item-click="(data) => emit('item-click', data)" />
              </q-btn>
            </div>
          </div>
        </div>
        <!-- Card Body with Key Information -->
        <div class="grid-card-body" :class="isMobile ? 'mobile-grid-card-body' : ''">
          <div class="row q-col-gutter-sm">
            <div v-for="col in displayColumns" :key="col.name" class="col-6">
              <div class="grid-field" :class="isMobile ? 'mobile-grid-field' : ''">
                <div class="grid-field-label text-caption text-grey-6"
                  :class="isMobile ? 'mobile-grid-field-label' : ''">{{ col.label }}</div>
                <div class="grid-field-value text-body2 text-weight-medium"
                  :class="isMobile ? 'mobile-grid-field-value' : ''">
                  <template v-if="col.name === 'status' || col.name === 'is_active'">
                    <q-badge :color="getStatusColor(col.value)" :label="String(col.value || '')" rounded
                      class="grid-status-badge" />
                  </template>
                  <template v-else-if="col.format && typeof col.format === 'function'">
                    <span class="grid-formatted-value">{{ col.format(col.value, row) }}</span>
                  </template>
                  <template v-else>
                    <span class="grid-default-value">{{ col.value || '-' }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Expandable Content for Grid -->
        <div v-if="hasExpandableRows && isExpanded" class="grid-expanded-content q-mt-md q-pt-md">
          <q-separator class="q-mb-md" />
          <slot name="expanded-row" :row="row">
            <div class="text-center q-pa-md text-grey-6">
              <q-icon name="info_outline" color="primary" size="sm" class="q-mr-sm" />
              <span>Expanded details for {{ primaryText }}</span>
            </div>
          </slot>
        </div>
      </q-card-section>
      <!-- Expand Button for Grid -->
      <q-card-actions v-if="hasExpandableRows" align="center" class="q-pt-none grid-expand-section">
        <q-btn flat :size="isMobile ? 'md' : 'md'" color="primary"
          :icon="isExpanded ? 'expand_less' : 'expand_more'"
          :label="isExpanded ? 'Show Less' : 'Show More'" @click.stop="emit('toggle-expand')"
          class="grid-expand-btn" no-caps />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import MenuDropdown from '../Qmenu.vue';

interface Column {
  name: string;
  label: string;
  field: string | ((_row: any) => any);
  align?: string;
  sortable?: boolean;
  format?: (_value: any, _row: any) => string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  action?: string;
}

interface Props {
  row: any;
  rowIndex: number;
  columns?: Column[];
  menuItems: MenuItem[] | ((_row: any) => MenuItem[]);
  extraItem?: MenuItem;
  hasExpandableRows?: boolean | undefined;
  isExpanded?: boolean | undefined;
  isSelected?: boolean;
  showBadge?: boolean;
  badgeValue?: string;
  pagination?: {
    current_page: number;
    per_page: number;
  } | null;
}

const emit = defineEmits<{
  'card-click': [];
  'action-click': [];
  'toggle-expand': [];
  'hide-menu': [];
  'item-click': [data: any];
}>();

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  hasExpandableRows: false,
  isExpanded: false,
  isSelected: false,
  showBadge: false,
  badgeValue: ''
});

const $q = useQuasar();

const isMobile = computed(() => $q.screen.lt.sm);
const normalizedMenuItems = computed<MenuItem[]>(() => typeof props.menuItems === 'function' ? props.menuItems(props.row) : props.menuItems);

const primaryText = computed(() => {
  const nameFields = ['name', 'title', 'label', 'username'];
  for (const field of nameFields) {
    const value = props.row[field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  const firstCol = (props.columns || []).find(col => col.name !== 'id' && col.name !== 'actions' && col.name !== 'expand');
  if (firstCol && typeof firstCol.field === 'string') {
    const value = props.row[firstCol.field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  return 'Item';
});

const secondaryText = computed(() => {
  const secondaryFields = ['description', 'subtitle', 'phone', 'email', 'code', 'category'];
  for (const field of secondaryFields) {
    const value = props.row[field];
    if (value && typeof value === 'string') return value;
    if (value && typeof value === 'number') return String(value);
  }
  return '';
});

const imageUrl = computed(() => {
  const imageFields = ['image', 'avatar', 'photo', 'picture'];
  for (const field of imageFields) {
    const value = props.row[field];
    if (value && typeof value === 'string' && value.trim() !== '') return value;
  }
  return null;
});

const hasImage = computed(() => {
  return (props.columns || []).some(col =>
    col.name === 'image' ||
    col.name === 'avatar' ||
    col.name === 'photo' ||
    col.name === 'picture'
  );
});

const cardIcon = computed(() => {
  const rowType = props.row.type;
  if (rowType && typeof rowType === 'string') {
    const iconMap: Record<string, string> = {
      'user': 'person',
      'admin': 'admin_panel_settings',
      'employee': 'badge',
      'customer': 'people',
      'product': 'inventory_2',
      'item': 'inventory',
      'warehouse': 'warehouse',
      'branch': 'business',
      'location': 'place',
      'category': 'category'
    };
    return iconMap[rowType] || 'folder';
  }
  if (props.row.username || props.row.email) return 'person';
  if (props.row.price || props.row.cost) return 'inventory_2';
  if (props.row.address) return 'place';
  return 'folder';
});

const displayColumns = computed(() => {
  return (props.columns || [])
    .filter(col => col.name !== 'actions' && col.name !== 'expand' && col.name !== 'image' && col.name !== 'avatar' && col.name !== 'name' && col.name !== 'title')
    .slice(0, isMobile.value ? 2 : 6)
    .map(col => ({
      name: col.name,
      label: col.label,
      align: col.align,
      field: col.field,
      sortable: col.sortable,
      format: col.format,
      value: typeof col.field === 'function' ? col.field(props.row) : props.row[col.field]
    }));
});

function getStatusColor(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'positive' : 'negative';
  if (typeof value === 'string') {
    const lowerVal = value.toLowerCase();
    if (lowerVal.includes('active') || lowerVal.includes('enabled') || lowerVal === 'true') return 'positive';
    if (lowerVal.includes('inactive') || lowerVal.includes('disabled') || lowerVal === 'false') return 'negative';
    if (lowerVal.includes('pending') || lowerVal.includes('warning')) return 'warning';
  }
  return 'primary';
}
</script>

<style scoped>
.grid-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.grid-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.selected-card {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.grid-card-header {
  position: relative;
}

.grid-avatar {
  border: 2px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.grid-card-title {
  flex: 1;
  min-width: 0;
}

.grid-title {
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
  margin-bottom: 4px;
}

.grid-description {
  color: #64748b;
  line-height: 1.4;
}

.grid-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.grid-actions-container {
  position: relative;
}

.grid-actions-btn {
  color: #64748b;
  transition: all 0.2s ease;
}

.grid-actions-btn:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.grid-card-body {
  margin-top: 16px;
}

.grid-field {
  margin-bottom: 12px;
}

.grid-field-label {
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.grid-field-value {
  color: #1e293b;
  font-weight: 600;
  word-break: break-word;
}

.grid-status-badge {
  font-size: 0.75rem;
  font-weight: 600;
}

.grid-expanded-content {
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  margin-top: 16px;
  padding-top: 16px;
}

.grid-expand-section {
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.grid-expand-btn {
  font-weight: 500;
  border-radius: 20px;
  padding: 8px 16px;
}

/* Mobile Responsive */
.mobile-grid-card {
  margin-bottom: 16px;
}

.mobile-grid-card-header {
  flex-direction: column;
  align-items: flex-start;
}

.mobile-header-row {
  flex-direction: column;
  gap: 12px;
}

.mobile-header-main {
  width: 100%;
  justify-content: space-between;
}

.mobile-title {
  font-size: 1.1rem;
}

.mobile-description {
  font-size: 0.875rem;
}

.mobile-grid-card-body {
  margin-top: 12px;
}

.mobile-grid-field {
  margin-bottom: 8px;
}

.mobile-grid-field-label {
  font-size: 0.7rem;
}

.mobile-grid-field-value {
  font-size: 0.875rem;
}

.mobile-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Responsive breakpoints */
@media (max-width: 599px) {
  .grid-card {
    margin-bottom: 16px;
  }

  .grid-title {
    font-size: 1rem;
  }

  .grid-description {
    font-size: 0.8rem;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .grid-card {
    margin-bottom: 20px;
  }
}

@media (min-width: 1024px) {
  .grid-card {
    margin-bottom: 24px;
  }
}
</style>
