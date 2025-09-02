import { boot } from "quasar/wrappers";
import { useAuthStore } from "src/stores/authStore";
import { useMeStore } from "src/stores/meStore";
import { useProfileStore } from "src/stores/profileStore";

export default boot(async ({ router, store }) => {
  const authStore = useAuthStore(store);
  const meStore = useMeStore(store);
  const profileStore = useProfileStore(store);

  const hasStoredToken = authStore.loadStoredAuth();
  if (hasStoredToken && authStore.token) {
    try {
      const userData = await authStore.fetchCurrentUser();
      if (userData) {
        meStore.setUserData(userData);
        profileStore.setUserData(userData);
      }
    } catch {
      // ignore; axios interceptor / router guard will handle
    }
  }

  const userTypePermissions: Record<string, string[]> = {
    admin: [
      "admin-section",
      "accountant-section",
      "item-section",
      "branch-section",
      "item-category-section",
      "employee-section",
      "location-section",
      "customer-section",
      "item-transaction-section",
      "transaction-section",
      "offer-section",
      "expense-section",
      "reports",
      "profile",
      "logs-section",
      "blum-section",
      "how-to-use",
    ],
    accountant: [],
    employee: [
      "item-section",
      "transfer-request-section",
      "warehouse-transfer-section",
      "branch-section",
      "item-category-section",
      "offer-section",
      "location-section",
      "item-transaction-section",
      "transaction-section",
      "expense-section",
      "profile",
      "blum-section",
      "customer-section",
      "how-to-use",
    ],
    customer: ["transaction-section", "dashboard", "offer-section"],
  };

  function hasPermission(userType: string, routePath: string): boolean {
    const permissions = userTypePermissions[userType] || [];
    return permissions.some((permission) => {
      if (permission === "reports") return routePath.includes("/reports/");
      if (permission === "expense-section")
        return routePath.includes("/expense-section") || routePath.includes("/expense-category-section");
      if (permission === "transaction-section")
        return routePath.includes("transaction-section") || routePath.includes("/invoice/");
      return routePath.includes(permission);
    });
  }

  router.beforeEach((to, _from, next) => {
    const isAuthenticated = !!authStore.token;
    if (isAuthenticated && authStore.currentUser?.type) {
      if (to.path === "/" || to.path === "") return next();
      const userType = authStore.currentUser.type;
      if (!hasPermission(userType, to.path)) {
        return next({ path: "/", query: { error: "unauthorized" } });
      }
    }
    return next();
  });
});
