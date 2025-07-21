import { computed } from 'vue';
import { useAuthStore } from 'src/stores/authStore';

export function usePermissions() {
  const authStore = useAuthStore();

  // Define user type permissions
  const userTypePermissions: Record<string, string[]> = {
    admin: [
      'admin-section',
      'accountant-section',
      'item-section',
     'branch-section',
      'item-category-section',
      'offer-section',
      'employee-section',
      'location-section',
      'customer-section',
'transaction-section',
      'item-transaction-section',

      'reports',
      'profile',
      'logs-section',
      'warehouse-transfer-section',
      'blum-section'
    ],
    accountant: [

    ],
    employee: [
       'item-section',
      'transfer-request-section',
      'warehouse-transfer-section',
     'branch-section',
      'item-category-section',
      'offer-section',
      'location-section',
      'item-transaction-section',
      'transaction-section',
      'profile',
        'customer-section',
      'blum-section'
    ],
    customer:[
      'transaction-section',
      'dashboard',
         'offer-section',
    ]
  };

  const userType = computed(() => authStore.currentUser?.type || '');
  const isAdmin = computed(() => userType.value === 'admin');
  const isAccountant = computed(() => userType.value === 'accountant');
  const isEmployee = computed(() => userType.value === 'employee');

  function hasPermission(section: string): boolean {
    const permissions = userTypePermissions[userType.value] || [];
    return permissions.includes(section);
  }

  function canAccessReports(): boolean {
    return hasPermission('reports');
  }

  function canAccessAdminSection(): boolean {
    return hasPermission('admin-section');
  }

  function canAccessAccountantSection(): boolean {
    return hasPermission('accountant-section');
  }

  function canAccessLogsSection(): boolean {
    return hasPermission('logs-section');
  }

  function canManageUsers(): boolean {
    return isAdmin.value;
  }
  function canManageFinances(): boolean {
    return isAdmin.value || isAccountant.value;
  }

  function requirePermission(section: string, errorMessage?: string): boolean {
    const hasAccess = hasPermission(section);
    if (!hasAccess) {
      const message = errorMessage || `You don't have permission to access ${section}`;
      authStore.setUnauthorizedError(message);
    }
    return hasAccess;
  }

  return {
    userType,
    isAdmin,
    isAccountant,
    isEmployee,
    hasPermission,
    canAccessReports,
    canAccessAdminSection,
    canAccessAccountantSection,
    canAccessLogsSection,
    canManageUsers,
    canManageFinances,
    requirePermission
  };
}
