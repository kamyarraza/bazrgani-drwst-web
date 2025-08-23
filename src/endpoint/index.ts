export const endPoints = {
  home: {
    dashboard: "dashboard",
    me: "/me?relations=stickyNotes,branch",
    changePassword: "/change-password",
    updateProfile: "/update-profile",
    changeProfileImage: "/change-profile-image",
    authenticatedDevices: "/authenticated-devices",
    revokeToken: "/revoke-token",
    details: "/details",
  },
  notification: {
    getUnreads: "/notifications/get-unreads",
    markAsRead: (notificationId: string | number) =>
      `/notifications/${notificationId}/mark-as-read`,
    markAllAsRead: "/notifications/unreads/mark-all-as-read",
  },
  stickyNote: {
    create: "/sticky-notes",
    update: (stickyNoteId: string | number) => `/sticky-notes/${stickyNoteId}`,
    delete: (stickyNoteId: string | number) => `/sticky-notes/${stickyNoteId}`,
  },
  auth: {
    login: "/login",
    logout: "/logout",
    refresh: "/refresh",
    logoutAll: "/logout-all",
    me: "/me?relations=stickyNotes,branch",
    updateProfile: "/update-profile",
  },
  exchangeRate: {
    create: "/exchange-rates",
    activeRate: "/exchange-rates/active-rate",
  },
  asset: {
    activityLogs: {
      list: "/activity-logs",
    },
  },
  admin: {
    list: "/admins",
    create: "/admins",
    details: (adminId: string) => `/admins/${adminId}`,
    update: (adminId: string) => `/admins/${adminId}`,
  },

  customer: {
    list: "/customers",
    create: "/customers",

    details: (id: string) => `/customers/${id}`,
    update: (id: string) => `/customers/${id}`,
    createAccount: (id: string) => `/customers/${id}/create-account`,
    borrow: (id: string) => `/customers/${id}/borrowing`,
    bulkPaymentReceive: (id: string) => `/transactions/${id}/bulk-payment/receive/customer`,
  },
  // Using locations instead of location for consistency
  // location endpoint removed as it's duplicated by the more complete locations endpoint
  accountant: {
    list: "/accountants",
    create: "/accountants",
    details: (accountantId: string) => `/accountants/${accountantId}`,
    update: (accountantId: string) => `/accountants/${accountantId}`,
  },
  locations: {
    list: "/locations",
    create: "/locations",
    details: (locationId: string) => `/locations/${locationId}`,
    update: (locationId: string) => `/locations/${locationId}`,
  },
  transaction: {
    create: (type: "purchase" | "sell") => `/transactions/items/${type}`,
    list: (type: "purchase" | "sell") => `/transactions/${type}/index`,
    one: (transactionId: string) => `/transactions/${transactionId}`,
    freeding: (transactionId: string) =>
      `/transactions/freeding/${transactionId}`,
    paySupplier: (transactionId: string) =>
      `/transactions/${transactionId}/payment/pay/supplier/normal`,
    receiveCustomer: (transactionId: string) =>
      `/transactions/${transactionId}/payment/receive/customer/normal`,
    refund: "/transactions/refund/items",
  },

  // Rename items to item to match our store naming convention
  item: {
    list: "/items",
    create: "/items",
    details: (itemId: string | number) => `/items/${itemId}`,
    update: (itemId: string | number) => `/items/${itemId}`,
    delete: (itemId: string | number) => `/items/${itemId}`,
  },
  branch: {
    list: "/branches",
    create: "/branches",
    details: (branchId: string | number) => `/branches/${branchId}`,
    update: (branchId: string | number) => `/branches/${branchId}`,
    toggleActive: (branchId: string | number) =>
      `/branches/toggle-active/${branchId}`,
    report: (branchId: string | number) => `/branches/warehouses/items/${branchId}`,
  },
  warehouse: {
    list: "/warehouses?relations=items",
    create: "/warehouses",
    details: (warehouseId: string | number) => `/warehouses/${warehouseId}/get/items`,
    update: (warehouseId: string | number) => `/warehouses/${warehouseId}`,
    toggleActive: (warehouseId: string | number) =>
      `/warehouses/toggle-active/${warehouseId}`,
  },

  // Add missing endpoint for branch warehouses - supports search with ?query=something
  branchWarehouses: (branchId: string | number) =>
    `/warehouses/${branchId}/index`,
  specialwarehouseItems: (wId: string | number) => `warehouses/${wId}/get/items`,
  // Add warehouse items endpoints
  warehouseItems: {
    list: (warehouseId: string | number) => `/warehouses/${warehouseId}/items`,
    add: (warehouseId: string | number) => `/warehouses/${warehouseId}/items`,
    update: (warehouseId: string | number, itemId: string | number) =>
      `/warehouses/${warehouseId}/items/${itemId}`,
    delete: (warehouseId: string | number, itemId: string | number) =>
      `/warehouses/${warehouseId}/items/${itemId}`,
  },

  employee: {
    list: "/employees",
    create: "/employees",
    details: (employeeId: string | number) => `/employees/${employeeId}`,
    update: (employeeId: string | number) => `/employees/${employeeId}`,
  },

  itemCategory: {
    list: "/item-categories",
    create: "/item-categories",
    details: (itemCategoryId: string | number) =>
      `/item-categories/${itemCategoryId}`,
    update: (itemCategoryId: string | number) =>
      `/item-categories/${itemCategoryId}`,
    toggleStatus: (itemCategoryId: string | number) =>
      `/item-categories/toggle-status/${itemCategoryId}`,
  },

  transactions: {
    list: "/transactions",
    create: "/transactions",
    details: (transactionId: string | number) =>
      `/transactions/${transactionId}`,
    update: (transactionId: string | number) =>
      `/transactions/${transactionId}`,
    delete: (transactionId: string | number) =>
      `/transactions/${transactionId}`,
  },
  report: {
    branches: "/reports/get/branches",
    warehouses: "/reports/get/warehouses",
    itemCategories: "/reports/get/item-categories",
    purchases: "/reports/get/purchases",
    sells: "/reports/get/sells",
  },

  offer: {
    list: "/offers",
    create: "/offers",
    details: (offerId: string | number) => `/offers/${offerId}`,
    update: (offerId: string | number) => `/offers/${offerId}`,
    changeStatus: (offerId: string | number, status: string) =>
      `/offers/${offerId}/${status}`,
  },

  warehouseItemTransfer: {
    // Returns a paginated list of pending warehouse item transfer requests where the authenticated user's branch is the source. / also has relations=fromWarehouse,toWarehouse both consist of  {id and name},
    getRequests: "/warehouse/items/transfer/requests",
    // Returns a paginated list of approved warehouse item transfers where the authenticated user's branch is the destination / also has relations=fromWarehouse,toWarehouse both consist of  {id and name}, .
    getIncomingTransfers: "/warehouse/items/transfer/incoming-transfers",
    // Creates a new warehouse item transfer request with status pending.
    request: "/warehouse/items/transfer/request",
    // Creates and approves a warehouse item transfer in a single step.
    transfer: "/warehouse/items/transfer/transfer",
    // Approves a pending warehouse item transfer and deducts the items from the source warehouse.
    approve: (transferId: string | number) =>
      `/warehouse/items/transfer/${transferId}/approve`,
    // Marks an approved warehouse item transfer as completed and adds the items to the destination warehouse.
    complete: (transferId: string | number) =>
      `/warehouse/items/transfer/${transferId}/complete`,
    // Rejects a pending warehouse item transfer request.
    reject: (transferId: string | number) =>
      `/warehouse/items/transfer/${transferId}/reject`,
  },

  blumItem: {
    getAll: "/blum/items",
    create: "/blum/items",
    update: (id: string | number) => `/blum/items/${id}`,
    delete: (id: string | number) => `/blum/items/${id}`,
  },

  blumSet: {
    getAll: "/blum/sets",
    create: "/blum/sets",
    getOne: (id: string | number) => `/blum/sets/${id}`, // Fixed inconsistency
    update: (id: string | number) => `/blum/sets/${id}`,
    delete: (id: string | number) => `/blum/sets/${id}`,
  },

  blumTransaction: {
    purchase: "/blum/transactions/blum-items/purchase",
    sell: "/blum/transactions/blum-items/sell",
    getBlumTransactions: (type: "purchase" | "sell") =>
      `/blum/transactions/blum-items/${type}/index`,
    getBlumTransaction: (transaction: string) =>
      `/blum/transactions/blum-items/${transaction}`,
  },

  cashbox: {
    details: (branchId: string | number) => `/cashbox/${branchId}`,
    open: (branchId: string | number) => `/cashbox/${branchId}/open`,
    close: (branchId: string | number) => `/cashbox/${branchId}/close`,
    deposit: (branchId: string | number) => `/cashbox/${branchId}/deposit`,
    withdraw: (branchId: string | number) => `/cashbox/${branchId}/withdraw`,
  },

  expenseCategory: {
    list: "/expenses/categories",
    create: "/expenses/categories",
    details: (id: string | number) => `/expenses/categories/${id}`,
    update: (id: string | number) => `/expenses/categories/${id}`,
    delete: (id: string | number) => `/expenses/categories/${id}`,
  },

  expense: {
    list: "/expenses/expenses",
    create: "/expenses/expenses",
    details: (id: string | number) => `/expenses/expenses/${id}`,
    update: (id: string | number) => `/expenses/expenses/${id}`,
    delete: (id: string | number) => `/expenses/expenses/${id}`,
  },
};
