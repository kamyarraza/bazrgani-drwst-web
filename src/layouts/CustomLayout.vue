<template>
  <q-layout view="hHh LpR fFf">
    <!-- Header -->
    <q-header class="custom-header bg-primary text-white">
      <q-toolbar class="toolbar-container">
        <!-- Left Section -->
        <div class="header-left flex items-center">
          <q-btn
            flat
            dense
            round
            icon="menu"
            :aria-label="t('layout.toggleSidebar')"
            class="menu-toggle-btn q-mr-md"
            @click="toggleSidebar"
          />

          <div class="brand-section">
            <q-toolbar-title class="brand-title">
              {{ t('layout.title') }}
            </q-toolbar-title>
          </div>
        </div>

        <!-- Right Section -->
        <div class="header-right flex items-center q-gutter-sm">
          <!-- Language Selector -->
          <q-btn-dropdown
            flat
            dense

            icon="language"
            :aria-label="t('layout.languageSelector')"

            dropdown-icon=""
          >
            <q-list class="language-menu">
              <q-item clickable v-close-popup @click="setLocale('ckb')" class="language-item">
                <q-item-section avatar>
                  <q-avatar size="20px" class="flag-avatar">🇮🇶</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>کوردی</q-item-label>
                  <q-item-label caption>Kurdish</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="setLocale('ar')" class="language-item">
                <q-item-section avatar>
                  <q-avatar size="20px" class="flag-avatar">🇸🇦</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>العربية</q-item-label>
                  <q-item-label caption>Arabic</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="setLocale('en-US')" class="language-item">
                <q-item-section avatar>
                  <q-avatar size="20px" class="flag-avatar">🇺🇸</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>English</q-item-label>
                  <q-item-label caption>English</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <Qbtn flat @click="notificationStore.toggleNotificationPopup" btn-color="primary" btn-label=""  >
            <template #default>
              <q-icon name="notifications_none" color="white" />
              <q-badge
                v-if="notificationStore.unreadCount > 0"
                color="red"
                floating
                transparent
                class="notification-badge"
              >
                {{ notificationStore.unreadCount }}
              </q-badge>
            </template>
          </Qbtn>
          <NotificationPopup v-if="notificationStore.isOpenNotfication" />
          <!-- User Profile Dropdown -->
          <div class="user-profile-section">
            <q-btn-dropdown
              flat
              no-caps
              class="user-profile-btn"
              dropdown-icon="keyboard_arrow_down"
            >
              <template #label>
                <div class="user-profile-content flex items-center">
                  <q-avatar size="36px" class="user-avatar">
                    <img v-if="userProfile?.image" :src="userProfile.image" alt="Profile">
                    <q-icon v-else name="person" />
                  </q-avatar>
                  <div class="user-info q-ml-sm" v-if="!isMobile">
                    <div class="user-name">{{ userProfile?.name.split(" ")[0] || 'User' }}</div>
                    <div class="user-role">{{ userProfile?.role || 'User' }}</div>
                  </div>
                </div>
              </template>

              <q-list class="user-menu">
                <!-- Profile Info Section -->
                <q-item class="user-menu-header">
                  <q-item-section avatar>
                    <q-avatar size="40px">
                      <img v-if="userProfile?.image" :src="userProfile.image" alt="Profile">
                      <q-icon v-else name="person" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ userProfile?.name || 'User' }}</q-item-label>
                    <q-item-label caption>{{ userProfile?.username }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <!-- Edit Profile -->
                <q-item clickable @click="$router.push('/profile')" class="menu-item">
                  <q-item-section avatar>
                    <q-icon name="edit" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ t('profile.edit') }}</q-item-label>
                    <q-item-label caption>{{ t('profile.editDescription') }}</q-item-label>
                  </q-item-section>
                </q-item>


                <q-separator />

                <!-- Logout -->
                <q-item clickable @click="handleLogout" class="menu-item logout-item">
                  <q-item-section avatar>
                    <q-icon name="logout" color="red-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-red-6">{{ t('auth.logout') }}</q-item-label>
                    <q-item-label caption>{{ t('auth.logoutDescription') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Custom Sidebar -->
    <Sidebar :is-open="sidebarOpen" @toggle="toggleSidebar" />

    <!-- Main Content -->
    <q-page-container :class="{ 'content-shifted': sidebarOpen && !isMobile }" class="page-container-transition">
      <ErrorBoundary>
        <router-view v-slot="{ Component, route }">
          <transition
            name="page-fade"
            mode="out-in"
            appear
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </ErrorBoundary>
      <FabAction
        :actions="fabActions"
        @action="onFabAction"
      />
      <Note v-if="showNote" @close="showNote = false" :note-type="noteType" />
      <ExchangeForm v-model="showExchangeForm" @submit="handleExchangeSubmit" />
      <div class="q-mb-4rem"></div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { RouterView } from 'vue-router';
import Sidebar from 'src/components/main/Sidebar.vue';
import { useAuthStore } from 'src/stores/authStore';
import { useProfileStore } from 'src/stores/profileStore';
import { useLocale } from 'src/composables/useLocale';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FabAction from 'components/main/FabAction.vue';
import Note from 'components/common/Note.vue';
import ExchangeForm from 'components/exchange/ExchangeForm.vue';
import { useNotificationStore } from 'src/stores/notificationStore';
import { showNotify } from 'src/composables/Notify';
import NotificationPopup from 'src/components/notfication/NotificationPopup.vue';
import Qbtn from 'src/components/common/Qbtn.vue';
import ErrorBoundary from 'src/components/common/ErrorBoundary.vue';

const { t } = useI18n();
const { setLocale } = useLocale();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const notificationStore = useNotificationStore();
const sidebarOpen = ref(false);
const isMobile = ref(false);
const router = useRouter();
// Get user profile from store
const userProfile = computed(() => profileStore.userProfile);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024;
  // Auto-close sidebar on desktop if it was open on mobile
  if (!isMobile.value && sidebarOpen.value) {
    // Don't auto-close on desktop, but make sure layout is correct
  }
};

onMounted(async () => {
  const hideRecaptchaBadge = () => {
    const badge = document.querySelector('.grecaptcha-badge') as HTMLElement
    if (badge) {
      badge.classList.remove('show-badge')
      badge.style.visibility = 'hidden'
      badge.style.opacity = '0'
      console.log('🔒 reCAPTCHA badge hidden on custom layout')
    }
  }

  // Hide immediately and with delays
  hideRecaptchaBadge()
  setTimeout(hideRecaptchaBadge, 1000)
  setTimeout(hideRecaptchaBadge, 3000)

  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  // Only fetch data if not already loaded to prevent duplicate API calls
  const promises: Promise<unknown>[] = [];

  // Check if userProfile data exists and is not being fetched, otherwise skip
  if (!userProfile.value && !profileStore.loading) {
    console.log('🔄 CustomLayout: Fetching user profile (not loaded yet)');
    promises.push(
      profileStore.fetchUserProfile().catch(error => {
        console.log('Failed to fetch user profile:', error);
      })
    );
  } else {
    console.log('✅ CustomLayout: User profile already loaded, skipping fetch');
  }

  // Check if notifications exist and are not being fetched, otherwise skip
  if (notificationStore.notifications.length === 0 && !notificationStore.loading) {
    console.log('🔄 CustomLayout: Fetching notifications (not loaded yet)');
    promises.push(
      notificationStore.getNotifications().catch(error => {
        console.log('Failed to fetch notifications:', error);
      })
    );
  } else {
    console.log('✅ CustomLayout: Notifications already loaded, skipping fetch');
  }

  // Execute remaining API calls in parallel to reduce loading time
  if (promises.length > 0) {
    console.log(`🚀 CustomLayout: Making ${promises.length} API call(s)`);
    await Promise.allSettled(promises);
  } else {
    console.log('✅ CustomLayout: No API calls needed, all data already loaded');
  }

  // Start auto-refresh for notifications with 50-second interval
  console.log('🔔 Starting notification auto-refresh (every 50 seconds)');
  notificationStore.startAutoRefresh();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
  // Stop notification auto-refresh
  console.log('🛑 Stopping notification auto-refresh');
  notificationStore.stopAutoRefresh();
});

const showNote = ref(false);
const showExchangeForm = ref(false);
const noteType = ref<'new' | 'all'>('new'); // Control which type of note view to show
const fabActions = [
  { icon: 'note_add', name: 'new_note', color: 'amber', textColor: 'black' },
  { icon: 'notes', name: 'all_notes', color: 'amber', textColor: 'black' },
  { icon: 'currency_exchange', name: 'exchange', color: 'green', textColor: 'white' },
];

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Handle logout action
async function handleLogout(): Promise<void> {
  try {
    await authStore.logout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

function onFabAction(action: { icon: string; name: string; color?: string; textColor?: string }) {
  if (action.name === 'new_note') {
    showNote.value = true;
    // Tell Note component to show a new note
    noteType.value = 'new';
  } else if (action.name === 'all_notes') {
    showNote.value = true;
    // Tell Note component to show all notes
    noteType.value = 'all';
  } else if (action.name === 'exchange') {
    showExchangeForm.value = true;
  }
  // Add more actions here as needed
}

// Handle exchange form submission
function handleExchangeSubmit() {
  // This function will be called when the exchange form is submitted
  console.log('Exchange rate submitted successfully');
}
watch(() => authStore.isLoggedOut, async (val) => {
  console.log('isLoggedOut', val)

  await router.push({ name: 'login' })
})

// Watch for unauthorized access errors
watch(() => authStore.unauthorizedError, (errorMessage) => {
  if (errorMessage) {
    showNotify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      duration: 5000,

    });
    // Clear the error after showing notification
    authStore.clearUnauthorizedError();
  }
})
</script>

<style scoped>
.page-container-transition {
  transition: margin-left 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  will-change: margin-left;
}

.content-shifted {
  margin-left: 280px; /* Match the sidebar width */
}

/* Mobile responsive - no margin shift on small screens */
@media (max-width: 1024px) {
  .content-shifted {
    margin-left: 0;
  }
}

/* Page Container */
.page-container-transition {
  position: relative;
  min-height: calc(100vh - 64px); /* Subtract header height */
  overflow: hidden;
}

/* Page Transition Animations */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-active {
  transition-delay: 0.1s;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(15px) scale(0.98);
}

.page-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.page-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition-duration: 0.1s;
    transform: none !important;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    transform: none;
  }
}

/* Mobile optimizations for transitions */
@media (max-width: 768px) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition-duration: 0.25s;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    transform: translateY(10px) scale(0.99);
  }
}

/* Legacy content-resize transition (keeping for compatibility) */
.content-resize-enter-active,
.content-resize-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  overflow: hidden;
}

.content-resize-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.content-resize-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.content-resize-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.content-resize-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.custom-header {
  z-index: 101; /* Make sure header is above sidebar */
}

.toolbar-container {
  min-height: 64px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-right {
  gap: 8px;
}

.menu-toggle-btn {
  color: white;
  transition: all 0.2s ease;
}

.menu-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.brand-section {
  margin-left: 8px;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  letter-spacing: -0.025em;
}

.language-btn,
.notification-btn {
  color: white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  position: relative;
}

.language-btn:hover,
.notification-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.05);
}

.notification-btn.has-notifications {
  animation: pulse-notification 2s infinite;
}

.notification-btn.has-notifications:hover {
  animation: none;
  transform: scale(1.05);
}

.notification-badge {
  animation: badge-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  top: 6px;
  right: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
}

.notification-tooltip {
  font-size: 13px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
}

.tooltip-count {
  font-weight: 600;
  color: #ff5722;
}

@keyframes pulse-notification {
  0%, 50%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  25% {
    transform: scale(1.05);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
  }
}

@keyframes badge-appear {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(22.5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.language-menu {
  min-width: 180px;
  border-radius: 12px;
  padding: 8px;
}

.language-item {
  border-radius: 8px;
  margin: 2px 0;
  transition: all 0.2s ease;
}

.language-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
}

.flag-avatar {
  font-size: 16px;
}

.user-profile-section {
  margin-left: 8px;
}

.user-profile-btn {
  border-radius: 12px;
  padding: 4px 8px;
  transition: all 0.2s ease;
  min-height: 44px;
}

.user-profile-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-profile-btn .q-btn-dropdown__arrow {
  color: white;
  font-size: 18px;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.user-profile-btn.q-btn--active .q-btn-dropdown__arrow {
  transform: rotate(180deg);
}

.user-profile-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-menu {
  min-width: 280px;
  border-radius: 16px;
  padding: 12px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.user-menu-header {
  padding: 16px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%);
  margin-bottom: 8px;
}

.menu-item {
  border-radius: 10px;
  margin: 2px 0;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateX(2px);
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.05);
}

.q-separator {
  margin: 8px 0;
  background-color: rgba(0, 0, 0, 0.06);
}

.q-mb-4rem {
  margin-bottom: 4rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .toolbar-container {
    padding: 0 4px;
    min-height: 48px;
  }
  .brand-title {
    font-size: 1rem;
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .brand-section {
    margin-left: 4px;
  }
  .header-left {
    gap: 2px;
  }
  .header-right {
    gap: 2px;
  }
  .language-btn,
  .notification-btn,
  .user-profile-btn {
    width: 32px;
    height: 32px;
    min-height: 32px;
    padding: 0;
    font-size: 16px;
  }
  .user-profile-content {
    gap: 2px;
  }
  .user-avatar {
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
  }
  .user-info {
    display: none;
  }
  .q-btn__content {
    min-width: 0;
    padding: 0 2px;
  }
  .notification-badge {
    font-size: 10px;
    min-width: 14px;
    height: 14px;
    top: 2px;
    right: 2px;
  }
  .flag-avatar {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .user-menu {
    min-width: 240px;
    max-width: 90vw;
  }
}
</style>

