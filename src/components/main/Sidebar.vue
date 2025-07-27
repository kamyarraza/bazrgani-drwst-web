<template>
  <!-- Overlay backdrop for mobile -->
  <div
    v-if="isOpen && isMobile"
    class="sidebar-overlay"
    @click="closeSidebar"
  ></div>

  <div
    class="custom-sidebar"
    :class="{
      'sidebar-closed': !isOpen,
      'sidebar-mobile': isMobile
    }"
  >
    <div class="sidebar-inner">
      <!-- Brand/App Logo -->


      <!-- Navigation Links -->
      <div class="sidebar-menu">
        <div
          v-for="(section, index) in navigationSections"
          :key="index"
          class="menu-section"
        >
          <div class="section-header" @click="toggleSection(index)">
            <div class="section-title">{{ section.title }}</div>
            <q-icon
              :name="isRTL ? (sectionStates[index] ? 'expand_less' : 'expand_more') : (sectionStates[index] ? 'expand_less' : 'expand_more')"
              size="sm"
              class="section-icon"
              :class="{ 'section-icon-expanded': sectionStates[index] }"
              :style="{
                transform: sectionStates[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)'
              }"
            />
          </div>

          <div class="nav-links" v-show="sectionStates[index]">
            <router-link
              v-for="link in section.links"
              :key="link.path"
              :to="link.path"
              class="nav-link"
              active-class="nav-link-active"
              :exact="link.path === '/'"
              @click="handleNavLinkClick"
            >
              <div class="link-icon">
                <q-icon :name="link.icon" size="sm" />
              </div>
              <div class="link-text">{{ link.label }}</div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Footer Area with version info -->
      <div class="sidebar-footer">
        <div class="app-version">{{ t('layout.version') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { usePermissions } from 'src/composables/usePermissions';

const { t, locale } = useI18n();
const router = useRouter();
const permissions = usePermissions();

// Add RTL detection
const isRTL = computed(() => {
  return locale.value === 'ar' || locale.value === 'ckb';
});

// Mobile detection
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  // Set initial section state based on current route
  setActiveSectionFromRoute();

  // Close sidebar on route change for mobile
  router.afterEach(() => {
    if (isMobile.value && props.isOpen) {
      closeSidebar();
    }
    // Update active section when route changes
    setActiveSectionFromRoute();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits(['toggle']);

const closeSidebar = () => {
  if (props.isOpen) {
    emit('toggle');
  }
};

const handleNavLinkClick = () => {
  // Close sidebar on navigation link click for mobile
  if (isMobile.value) {
    closeSidebar();
  }
};

// Function to toggle section expansion
// Function to toggle section expansion - accordion behavior
const sectionStates = ref<boolean[]>([false, false, false, false, false, false]); // All sections closed by default

const toggleSection = (index: number) => {
  // Accordion behavior: close all other sections when opening a new one
  const newStates = sectionStates.value.map(() => false);

  // If the clicked section was already open, close it; otherwise, open it
  if (sectionStates.value[index]) {
    newStates[index] = false; // Close the section
  } else {
    newStates[index] = true; // Open only this section
  }

  sectionStates.value = newStates;
};

// Function to automatically open the appropriate section based on current route
const setActiveSectionFromRoute = () => {
  const currentPath = router.currentRoute.value.path;
  const newStates = sectionStates.value.map(() => false);

  // Find which section contains a link matching the current route
  navigationSections.value.forEach((section, sectionIndex) => {
    const hasActiveLink = section.links.some(link => {
      if (link.path === '/') {
        return currentPath === '/';
      }
      return currentPath.startsWith(link.path);
    });

    if (hasActiveLink) {
      newStates[sectionIndex] = true;
    }
  });

  sectionStates.value = newStates;
};

// Navigation structure with reactive isOpen property
const allNavigationSections = [
  {
    title: t('sidebar.overview'),
    isOpen: true, // Default open
    links: [
      { path: '/', label: t('sidebar.dashboard'), icon: 'dashboard', permission: null },
    ]
  },
  {
    title: t('sidebar.management'),
    isOpen: false,
    links: [
      { path: '/admin-section', label: t('sidebar.admin'), icon: 'admin_panel_settings', permission: 'admin-section' },
      { path: '/item-section', label: t('sidebar.items'), icon: 'inventory_2', permission: 'item-section' },
      { path: '/branch-section', label: t('sidebar.branches'), icon: 'store', permission: 'branch-section' },
      { path: '/item-category-section', label: t('sidebar.categories'), icon: 'category', permission: 'item-category-section' },
      { path: '/offer-section', label: t('sidebar.offers'), icon: 'local_offer', permission: 'offer-section' },
      { path: '/transfer-request-section', label: t('sidebar.transferRequests'), icon: 'swap_horiz', permission: 'transfer-request-section' },

      { path: '/transaction-section', label: t('sidebar.transactions'), icon: 'receipt_long', permission: 'transaction-section' },

    ]
  },
  {
    title: t('sidebar.people'),
    isOpen: false,
    links: [
      { path: '/accountant-section', label: t('sidebar.accountant'), icon: 'account_balance_wallet', permission: 'accountant-section' },
      { path: '/employee-section', label: t('sidebar.employees'), icon: 'people', permission: 'employee-section' },
      { path: '/customer-section', label: t('sidebar.customers'), icon: 'person', permission: 'customer-section' },
      { path: '/location-section', label: t('sidebar.locations'), icon: 'place', permission: 'location-section' },
    ]
  },
  {
    title: t('sidebar.blum'),
    isOpen: false,
    links: [
      { path: '/blum-section/items', label: t('sidebar.blumItems'), icon: 'inventory_2', permission: 'blum-section' },
      { path: '/blum-section/sets', label: t('sidebar.blumSets'), icon: 'category', permission: 'blum-section' },
      { path: '/blum-section/transactions', label: t('sidebar.blumTransactions'), icon: 'swap_horiz', permission: 'blum-section' },
    ]
  },
  {
    title: t('sidebar.reports'),
    isOpen: false,
    links: [
      { path: '/reports/branches', label: t('sidebar.branches'), icon: 'store', permission: 'reports' },
      { path: '/reports/warehouses', label: t('sidebar.warehouses'), icon: 'inventory', permission: 'reports' },
      { path: '/reports/categories', label: t('sidebar.categories'), icon: 'category', permission: 'reports' },
      { path: '/reports/purchases', label: t('sidebar.purchases'), icon: 'shopping_cart', permission: 'reports' },
      { path: '/reports/sells', label: t('sidebar.sells'), icon: 'point_of_sale', permission: 'reports' },
    ]
  },
  {
    title: t('sidebar.system'),
    isOpen: false,
    links: [
      { path: '/logs-section', label: t('sidebar.activityLog'), icon: 'history', permission: 'logs-section' },
    ]
  }
];

// Filter navigation sections based on user permissions
const navigationSections = computed(() => {
  return allNavigationSections.map(section => ({
    ...section,
    links: section.links.filter(link =>
      !link.permission || permissions.hasPermission(link.permission)
    )
  })).filter(section => section.links.length > 0);
});
</script>

<style scoped>
/* Overlay backdrop for mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  transition: opacity 0.3s ease;
}

.custom-sidebar {
  position: fixed;
  top: 50px; /* Adjust based on your header height */
  left: 0;
  height: calc(100vh - 50px);
  width: 280px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  will-change: transform;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cfd8dc #f5f5f5;
}

/* Mobile responsive behavior */
@media (max-width: 1024px) {
  .custom-sidebar {
    top: 0;
    height: 100vh;
    z-index: 1001;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
  }

  .sidebar-mobile {
    position: fixed !important;
  }
}

/* RTL support */
:deep([dir="rtl"]) .custom-sidebar {
  left: auto;
  right: 0;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.08);
}

:deep([dir="rtl"]) .sidebar-closed {
  transform: translateX(100%);
}

:deep([dir="rtl"]) .nav-link:hover {
  transform: translateX(-4px);
}

:deep([dir="rtl"]) .nav-links {
  padding-left: 0;
  padding-right: 0.75rem;
}

:deep([dir="rtl"]) .link-icon {
  margin-right: 0;
  margin-left: 12px;
}

/* RTL support for mobile */
@media (max-width: 1024px) {
  :deep([dir="rtl"]) .custom-sidebar {
    right: 0;
    left: auto;
    box-shadow: -2px 0 15px rgba(0, 0, 0, 0.2);
  }
}

.custom-sidebar::-webkit-scrollbar {
  width: 6px;
}

.custom-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-sidebar::-webkit-scrollbar-thumb {
  background-color: #cfd8dc;
  border-radius: 20px;
}

.sidebar-closed {
  transform: translateX(-100%);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 1rem;
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.brand-logo {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.logo-img {
  max-width: 100%;
  max-height: 100%;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #37474f;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
}

.menu-section {
  margin-bottom: 1.25rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.section-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.section-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #546e7a;
  font-weight: 600;
}

.section-icon {
  color: #78909c;
  transition: transform 0.2s ease;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.75rem;
  margin-top: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #455a64;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(176, 190, 197, 0.15);
  transform: translateX(4px);
}

.nav-link-active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.link-text {
  font-size: 0.95rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

.app-version {
  font-size: 0.75rem;
  color: #90a4ae;
}
</style>
