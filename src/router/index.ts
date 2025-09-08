import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useNotificationStore } from 'src/stores/notificationStore';

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, _from) => {
    if (to.path.startsWith('/auth')) {
      const notificationStore = useNotificationStore();
      try { notificationStore.stopAutoRefresh(); } catch { /* ignore */ }
    }

    if (to.path === '/maintenance') return true;

    const hasToken = !!localStorage.getItem('auth_token');
    const isAuthenticated = hasToken;

    if (!to.path.startsWith('/auth') && !to.path.startsWith('/maintenance') && !isAuthenticated) {
      return { path: '/auth/login' };
    }

    if (to.path.startsWith('/auth/login') && isAuthenticated) {
      return { path: '/dashboard' };
    }

    return true;
  });

  return Router;
});
