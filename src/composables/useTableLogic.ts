import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

export interface Column {
  name: string;
  label: string;
  field: string | ((row: any) => any);
  align?: string;
  sortable?: boolean;
  format?: (value: any, row: any) => string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  action?: string;
}

export function useTableLogic(props: {
  columns: Column[] | undefined;
  hasExpandableRows?: boolean | undefined;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null | undefined;
  maxPages?: number | undefined;
  userType?: string;
  allowedTypes?: string[];
  userBranchId?: number | null;
}) {
  const $q = useQuasar();

  const currentPage = ref(1);
  const expanded = ref<Record<string, boolean>>({});
  const selectedGridItems = ref<string[]>([]);
  const selectedRowId = ref<string | null>(null);

  function getSafeColumns(): Column[] {
    return Array.isArray(props.columns) ? props.columns : [];
  }

  // Computed properties
  const isRTL = computed(() => {
    return document.documentElement.dir === 'rtl';
  });

  const isGridMode = computed(() => {
    return $q.screen.lt.md;
  });

  const canViewTopRightAction = computed(() => {
    if (!props.userType || !props.allowedTypes?.length) return true;
    return props.allowedTypes.includes(props.userType);
  });

  const isEmployee = computed(() => {
    return props.userType === 'employee';
  });

  const userBranchId = computed(() => {
    return props.userBranchId;
  });

  const paginationNumber = computed(() => {
    return props.pagination?.per_page ? Number(props.pagination.per_page) : 10;
  });

  const maxPage = computed(() => {
    return props.pagination?.last_page || props.maxPages || 5;
  });

  const internalColumns = computed(() => {
    const columns = [...getSafeColumns()];

    // Add index column if not present (only for table mode)
    if (!columns.some(col => col.name === 'index')) {
      columns.unshift({
        name: 'index',
        label: '#',
        field: 'index',
        align: 'center',
        sortable: false
      } as Column);
    }

    // Add expand column if expandable rows are enabled (only for table mode)
    if (props.hasExpandableRows && !isGridMode.value) {
      columns.unshift({
        name: 'expand',
        label: '',
        field: 'expand',
        align: 'center',
        sortable: false
      } as Column);
    }

    // Ensure actions column has proper header if it exists
    const actionsColumnIndex = columns.findIndex(col => col.name === 'actions');
    if (actionsColumnIndex !== -1 && columns[actionsColumnIndex]) {
      const actionsCol = columns[actionsColumnIndex];
      columns[actionsColumnIndex] = {
        name: actionsCol.name,
        label: actionsCol.label || 'Actions',
        field: actionsCol.field || 'actions',
        align: actionsCol.align || 'center',
        sortable: false
      } as Column;
    }

    return columns;
  });

  // Helper functions
  function getRowKey(row: Record<string, unknown>): string {
    const id = (row as any).id;
    if (id && (typeof id === 'string' || typeof id === 'number')) {
      return String(id);
    }
    return `row_${Math.random().toString(36).substr(2, 9)}`;
  }

  function getPrimaryText(row: Record<string, unknown>): string {
    const nameFields = ['name', 'title', 'label', 'username'];
    for (const field of nameFields) {
      const value = (row as any)[field];
      if (value && typeof value === 'string') return value;
      if (value && typeof value === 'number') return String(value);
    }
    const firstCol = getSafeColumns().find(col => col.name !== 'id' && col.name !== 'actions' && col.name !== 'expand');
    if (firstCol && typeof firstCol.field === 'string') {
      const value = (row as any)[firstCol.field];
      if (value && typeof value === 'string') return value;
      if (value && typeof value === 'number') return String(value);
    }
    return 'Item';
  }

  function getSecondaryText(row: Record<string, unknown>): string {
    const secondaryFields = ['description', 'subtitle', 'phone', 'email', 'code', 'category'];
    for (const field of secondaryFields) {
      const value = (row as any)[field];
      if (value && typeof value === 'string') return value;
      if (value && typeof value === 'number') return String(value);
    }
    return '';
  }

  function getImageColumn(row: Record<string, unknown>): string | null {
    const imageFields = ['image', 'avatar', 'photo', 'picture'];
    for (const field of imageFields) {
      const value = (row as any)[field];
      if (value && typeof value === 'string' && value.trim() !== '') return value;
    }
    return null;
  }

  function hasImageColumn(): boolean {
    return internalColumns.value.some(col =>
      col.name === 'image' ||
      col.name === 'avatar' ||
      col.name === 'photo' ||
      col.name === 'picture'
    );
  }

  function getCardIcon(row: Record<string, unknown>): string {
    const rowType = (row as any).type;
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

    if ((row as any).username || (row as any).email) return 'person';
    if ((row as any).price || (row as any).cost) return 'inventory_2';
    if ((row as any).address) return 'place';
    return 'folder';
  }

  function getDisplayColumns(row: Record<string, unknown>, maxFields = 6) {
    return getSafeColumns()
      .filter(col =>
        col.name !== 'actions' &&
        col.name !== 'expand' &&
        col.name !== 'image' &&
        col.name !== 'avatar' &&
        col.name !== 'name' &&
        col.name !== 'title'
      )
      .slice(0, maxFields)
      .map(col => ({
        name: col.name,
        label: col.label,
        align: col.align,
        field: col.field,
        sortable: col.sortable,
        format: col.format,
        value: typeof col.field === 'function' ? col.field(row) : (row as any)[col.field]
      }));
  }

  function getStatusColor(value: unknown): string {
    if (typeof value === 'boolean') {
      return value ? 'positive' : 'negative';
    }
    if (typeof value === 'string') {
      const lowerVal = value.toLowerCase();
      if (lowerVal.includes('active') || lowerVal.includes('enabled') || lowerVal === 'true') return 'positive';
      if (lowerVal.includes('inactive') || lowerVal.includes('disabled') || lowerVal === 'false') return 'negative';
      if (lowerVal.includes('pending') || lowerVal.includes('warning')) return 'warning';
    }
    return 'primary';
  }

  function handleGridCardClick(row: Record<string, unknown>) {
    const rowId = getRowKey(row);
    const index = selectedGridItems.value.indexOf(rowId);

    if (index > -1) {
      selectedGridItems.value.splice(index, 1);
    } else {
      selectedGridItems.value.push(rowId);
    }
  }

  function handleGridAction(row: Record<string, unknown>) {
    selectedRowId.value = (row as any).id as string;
  }

  function toggleExpand(row: unknown) {
    const rowKey = getRowKey(row as Record<string, unknown>);
    expanded.value = expanded.value[rowKey] ? {} : { [rowKey]: true };
    return { row, expanded: expanded.value[rowKey] || false };
  }

  function handlePageChange(page: number) {
    currentPage.value = page;
    return page;
  }

  function getMenuItemsForRow(row: any, menuItems: MenuItem[] | ((_row: any) => MenuItem[])): MenuItem[] {
    if (typeof menuItems === 'function') {
      return menuItems(row);
    }
    return menuItems;
  }

  // Set currentPage from props when pagination changes
  if (props.pagination?.current_page) {
    currentPage.value = props.pagination.current_page;
  }

  return {
    // State
    currentPage,
    expanded,
    selectedGridItems,
    selectedRowId,

    // Computed
    isRTL,
    isGridMode,
    canViewTopRightAction,
    isEmployee,
    userBranchId,
    paginationNumber,
    maxPage,
    internalColumns,

    // Functions
    getRowKey,
    getPrimaryText,
    getSecondaryText,
    getImageColumn,
    hasImageColumn,
    getCardIcon,
    getDisplayColumns,
    getStatusColor,
    handleGridCardClick,
    handleGridAction,
    toggleExpand,
    handlePageChange,
    getMenuItemsForRow
  };
}
