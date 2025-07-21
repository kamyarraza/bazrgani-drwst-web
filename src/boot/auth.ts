import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'src/stores/authStore';
import { useMeStore } from 'src/stores/meStore';
import { useProfileStore } from 'src/stores/profileStore';

export default boot(async ({ router, store }) => {
  // Initialize auth store, meStore, and profileStore
  const authStore = useAuthStore(store);
  const meStore = useMeStore(store);
  const profileStore = useProfileStore(store);

  // Load stored authentication data
  const hasStoredToken = authStore.loadStoredAuth();

  // If we have a token, verify it with the server and get user data
  // Make only ONE API call to get user data and share it across stores
  if (hasStoredToken && authStore.token) {
    try {
      const userData = await authStore.fetchCurrentUser();

      if (userData) {
        // Share the fetched user data with other stores instead of making separate API calls
        meStore.setUserData(userData);
        profileStore.setUserData(userData);
      }
    } catch {
      // Token is invalid, it will be cleared by fetchCurrentUser
      // Also clear other stores on auth failure
      meStore.resetMe();
      profileStore.resetProfile();
    }
  }

  // Define user type permissions
  const userTypePermissions: Record<string, string[]> = {
    admin: [
      'admin-section',
      'accountant-section',
      'item-section',
      'branch-section',
      'item-category-section',
      'employee-section',
      'location-section',
      'customer-section',
      'item-transaction-section',
       'transaction-section',
       'offer-section',


      'reports',
      'profile',
      'logs-section',
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
      'blum-section',
        'customer-section',
    ],
    customer:[
      'transaction-section',
      'dashboard',
       'offer-section',
    ]
  };

  // Helper function to check if user has permission to access a route
  function hasPermission(userType: string, routePath: string): boolean {
    const permissions = userTypePermissions[userType] || [];

    // Check if the route path contains any of the allowed sections
    return permissions.some(permission => {
      if (permission === 'reports') {
        return routePath.includes('/reports/');
      }
      return routePath.includes(permission);
    });
  }

  // Navigation guard
  router.beforeEach((to, from, next) => {
    // Allow access to maintenance page without authentication
    if (to.path === '/maintenance') {
      return next();
    }

    // Allow access to 404 page without authentication
    if (to.path === '/404' || to.name === 'ErrorNotFound') {
      return next();
    }

    // Allow access to catch-all routes (404 scenarios) without authentication
    if (to.matched.length === 0 || to.matched.some(record => record.path === '/:catchAll(.*)*')) {
      return next();
    }

    // Check authentication - both token and user data should be present
    const isAuthenticated = !!authStore.token && !!authStore.currentUser && authStore.loggedIn;
    const userType = authStore.currentUser?.type;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !to.path.startsWith('/auth/')) {
      return next('/auth/login');
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (isAuthenticated && to.path.startsWith('/auth/')) {
      // Use router navigation for smoother transition
      return next('/');
    }

    // If authenticated, check user type permissions
    if (isAuthenticated && userType) {
      // Dashboard is always accessible for authenticated users
      if (to.path === '/' || to.path === '') {
        return next();
      }

      // Check if user has permission to access this route
      if (!hasPermission(userType, to.path)) {
        // Redirect to dashboard with error message
        return next({
          path: '/',
          query: {
            error: 'unauthorized',
            message: `Access denied. ${userType} users cannot access this section.`
          }
        });
      }
    }

    next();
  });
});
