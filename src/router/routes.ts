import type { RouteRecordRaw } from "vue-router";
const authRoutes: RouteRecordRaw = {
  path: "/auth",
  component: () => import("../layouts/authLayout.vue"),
  children: [
    {
      path: "login",
      component: () => import("../pages/auth/Login.vue"),
      name: "login",
    },
  ],
};

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/CustomLayout.vue"),
    children: [
      { path: "/dashboard", component: () => import("src/pages/dashboard/Index.vue") },
      {
        path: "admin-section",
        component: () => import("src/pages/admin/Index.vue"),
      },
      {
        path: "admin-notifications",
        component: () => import("src/pages/admin/NotificationsPage.vue"),
      },
      {
        path: "simple-notifications",
        component: () => import("src/pages/admin/SimpleNotifications.vue"),
      },
      {
        path: "test-notifications",
        component: () => import("src/pages/admin/TestNotifications.vue"),
      },
      {
        path: "pending-update-section",
        component: () => import("src/pages/pending_update/Index.vue"),
      },
      {
        path: "accountant-section",
        component: () => import("src/pages/accountant/Index.vue"),
      },
      {
        path: "item-section",
        component: () => import("src/pages/item/Index.vue"),
      },
      {
        path: "reports/item-chart-report",
        component: () => import("src/pages/report/TopSoldItemsChart.vue"),
      },
      {
        path: "branch-section",
        component: () => import("src/pages/branch/Index.vue"),
      },
      {
        path: "item-category-section",
        component: () => import("src/pages/item_category/Index.vue"),
      },
      {
        path: "employee-section",
        component: () => import("src/pages/employee/Index.vue"),
      },
      {
        path: "location-section",
        component: () => import("src/pages/location/index.vue"),
      },
      {
        path: "customer-section",
        component: () => import("src/pages/customer/index.vue"),
      },
      {
        path: "item-transaction-section",
        redirect: "/transaction-section", // Redirect to consolidated transaction page
      },
      {
        path: "transaction-section",
        component: () => import("src/pages/transaction/index.vue"),
      },
      {
        path: "invoice/:id",
        component: () => import("src/pages/invoice/PrintableInvoice.vue"),
        name: "printable-invoice",
      },
      {
        path: "reports/branches",
        component: () => import("src/pages/report/Branches.vue"),
      },
      {
        path: "reports/warehouses",
        component: () => import("src/pages/report/Warehouses.vue"),
      },
      {
        path: "reports/categories",
        component: () => import("src/pages/report/Categories.vue"),
      },
      {
        path: "reports/purchases",
        component: () => import("src/pages/report/Purchases.vue"),
      },
      {
        path: "reports/sells",
        component: () => import("src/pages/report/Sells.vue"),
      },
      {
        path: "profile",
        component: () => import("src/pages/profile/index.vue"),
      },
      {
        path: "how-to-use",
        component: () => import("src/pages/how2use.vue"),
      },
      {
        path: "logs-section",
        component: () => import("src/pages/logs/index.vue"),
      },
      {
        path: "offer-section",
        component: () => import("src/pages/offer/Index.vue"),
      },
      {
        path: "transfer-request-section",
        component: () => import("src/pages/transfer_request/index.vue"),
      },

      {
        path: "blum-section",
        component: () => import("src/pages/blum/Index.vue"),
      },
      {
        path: "blum-section/items",
        component: () => import("src/pages/blum/Items.vue"),
      },
      {
        path: "blum-section/sets",
        component: () => import("src/pages/blum/Sets.vue"),
      },
      {
        path: "blum-section/transactions",
        component: () => import("src/pages/blumTransaction/Index.vue"),
      },
      {
        path: "expense-category-section",
        component: () => import("src/pages/expense_category/Index.vue"),
      },
      {
        path: "expense-section",
        component: () => import("src/pages/expense/Index.vue"),
      },
    ],
  },
  {
    path: "/maintenance",
    component: () => import("src/pages/Maintenance.vue"),
  },
  // 404 Error page - outside of any layout to avoid auth issues
  {
    path: "/404",
    component: () => import("pages/ErrorNotFound.vue"),
    name: "ErrorNotFound",
  },
  authRoutes,

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
