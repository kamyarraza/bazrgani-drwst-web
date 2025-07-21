import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useNotificationStore } from 'src/stores/notificationStore';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Add navigation guards
  Router.beforeEach((to, from) => {
    // Stop notifications when navigating to any auth page
    if (to.path.startsWith('/auth')) {
      try {
        const notificationStore = useNotificationStore();
        notificationStore.stopAutoRefresh();
      } catch {
        // Could not stop notifications
      }
    }

    // Also stop notifications when leaving any authenticated area to auth
    if (from.path && !from.path.startsWith('/auth') && to.path.startsWith('/auth')) {
      try {
        const notificationStore = useNotificationStore();
        notificationStore.stopAutoRefresh();
      } catch {
        // Could not stop notifications on auth navigation
      }
    }

    // Allow access to maintenance page without authentication
    if (to.path === '/maintenance') {
      return true;
    }

    // Check if user is authenticated (has valid token in localStorage)
    const hasToken = !!localStorage.getItem('auth_token');

    // Also check if session is expired for non-persistent logins
    const rememberMe = localStorage.getItem('auth_remember') === 'true';
    const sessionExpiry = localStorage.getItem('auth_session_expiry');

    let isSessionValid = true;
    if (hasToken && !rememberMe && sessionExpiry) {
      try {
        const expiryTime = parseInt(sessionExpiry);
        const now = Date.now();
        if (now > expiryTime) {
          isSessionValid = false;
          // Clear expired session
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_remember');
          localStorage.removeItem('auth_session_expiry');
          localStorage.removeItem('auth_last_activity');
        }
      } catch {
        // If we can't parse the expiry time, consider session invalid
        console.warn('Invalid session expiry timestamp:', sessionExpiry);
        isSessionValid = false;
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_remember');
        localStorage.removeItem('auth_session_expiry');
        localStorage.removeItem('auth_last_activity');
      }
    }

    const isAuthenticated = hasToken && isSessionValid;

    // If path requires authentication and user is not authenticated
    if (!to.path.startsWith('/auth') && !to.path.startsWith('/maintenance') && !isAuthenticated) {
      // Redirect to login page
      return { path: '/auth/login' };
    }

    // If user is authenticated and tries to access login page
    if (to.path.startsWith('/auth/login') && isAuthenticated) {
      // Redirect to home page
      return { path: '/' };
    }

    // Allow navigation to proceed
    return true;
  });

  return Router;
});
