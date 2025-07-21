<template>
  <div class="devices-container">
    <div class="text-center q-mb-lg">
      <q-icon name="devices" size="60px" color="primary" class="devices-icon q-mb-md" />
      <div class="text-h5">{{ $t('profile.authenticatedDevices') }}</div>
      <div class="text-caption q-mt-sm">{{ $t('profile.devicesDescription') }}</div>
      <div class="q-mt-md">
        <Qbtn

          :btnLabel="$t('profile.logoutAll')"
          btnColor="red-4"
          :isLoading="loading"
          :isDisabled="loading || !devices.length"

          icon="logout"
          @click="handleLogoutAll"
        >

        </Qbtn>
      </div>
    </div>

    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm">{{ $t('profile.loading') }}</div>
    </div>

    <div v-else-if="!devices || !devices.length" class="text-center q-pa-lg empty-state">
      <q-icon name="devices_off" size="3em" color="grey-6" />
      <div class="text-subtitle1 q-mt-sm">{{ $t('profile.devicesSection.noDevices') }}</div>
    </div>

    <template v-else>
      <q-list bordered separator class="rounded-borders">
        <q-item v-for="device in devices" :key="device.id" :class="{ 'current-device': device.current }">
          <q-item-section avatar>
            <q-avatar :color="getDeviceColor(device)">
              <q-icon :name="getDeviceIcon(device)" color="white" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">
              {{ device.name }}
              <q-badge v-if="device.current" color="primary" class="q-ml-sm">{{ $t('profile.current') }}</q-badge>
            </q-item-label>
            <q-item-label caption lines="2">
              <div class="device-details">
                <span class="detail-item">
                  <q-icon name="browser" size="xs" class="q-mr-xs" />
                  {{ device.browser }}
                </span>
                <span class="detail-item">
                  <q-icon name="devices" size="xs" class="q-mr-xs" />
                  {{ device.device }}
                </span>
                <span class="detail-item">
                  <q-icon name="computer" size="xs" class="q-mr-xs" />
                  {{ device.platform }}
                </span>
              </div>
              <div class="detail-item q-mt-xs">
                <q-icon name="public" size="xs" class="q-mr-xs" />
                {{ device.ip_address }}
              </div>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-caption text-grey">
              <div class="last-used">
                {{ device.last_used_at_human || device.last_used_at_humans }}
              </div>
              <div class="created-at">
                {{ $t('profile.signedIn') }}: {{ device.created_at_human || device.created_at_humans }}
              </div>
            </div>
          </q-item-section>

          <q-item-section side v-if="!device.current">
            <q-btn
              flat
              round
              color="negative"
              icon="logout"
              size="sm"
              @click="confirmRevoke(device)"
            >
              <q-tooltip>{{ $t('profile.devicesSection.revoke') }}</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-mt-md text-caption text-grey text-italic">
        {{ $t('profile.devicesNote') }}
      </div>
    </template>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card style="min-width: 350px">        <q-card-section class="bg-negative text-white">
          <div class="text-h6">{{ $t('profile.devicesSection.revokeConfirm') }}</div>
        </q-card-section>

        <q-card-section>
          <p>{{ $t('profile.revokeDescription') }}</p>
          <p class="text-weight-medium" v-if="selectedDevice">
            {{ $t('profile.deviceInfo') }}: {{ selectedDevice.name }} - {{ selectedDevice.browser }} ({{ selectedDevice.platform }})
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup />
          <q-btn flat :label="$t('profile.devicesSection.revoke')" color="negative" @click="revokeDevice" :loading="revoking" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from 'src/stores/profileStore';
import Qbtn from 'src/components/common/Qbtn.vue';
import type { AuthenticatedDevice } from 'src/types/auth';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/authStore';
import { useRouter } from 'vue-router';
const { t: _t } = useI18n();
const profileStore = useProfileStore();
const loading = computed(() => profileStore.loading);
const devices = computed(() => profileStore.authenticatedDevices);
const router = useRouter()
// For revoke confirmation
const confirmDialog = ref(false);
const selectedDevice = ref<AuthenticatedDevice | null>(null);
const revoking = ref(false);
const authStore =useAuthStore()
// Fetch devices on component mount
onMounted(async () => {
  try {
    await profileStore.fetchAuthenticatedDevices();
    // Log devices data to console for debugging
    console.log('Authenticated devices:', profileStore.authenticatedDevices);
  } catch (err) {
    console.error('Error fetching devices:', err);
    // Error already handled by store
  }
});

// Helper function to safely get string values from device data
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Device UI helpers
const getDeviceIcon = (device: AuthenticatedDevice): string => {
  // Safely convert to string and lowercase, with fallbacks
  const platform = safeString(device.platform).toLowerCase();
  const deviceType = safeString(device.device).toLowerCase();

  if (platform.includes('android')) return 'phone_android';
  if (platform.includes('ios') || platform.includes('iphone')) return 'phone_iphone';
  if (platform.includes('mac')) return 'laptop_mac';
  if (platform.includes('windows')) return 'laptop_windows';
  if (platform.includes('linux')) return 'computer';
  if (deviceType.includes('tablet')) return 'tablet';
  if (deviceType.includes('mobile')) return 'smartphone';

  return 'devices';
};

const getDeviceColor = (device: AuthenticatedDevice): string => {
  // Safely convert to string and lowercase, with fallback
  const platform = safeString(device.platform).toLowerCase();

  if (device.current) return 'primary';
  if (platform.includes('android')) return 'green';
  if (platform.includes('ios') || platform.includes('iphone')) return 'grey-8';
  if (platform.includes('mac')) return 'blue-grey';
  if (platform.includes('windows')) return 'blue';
  if (platform.includes('linux')) return 'orange';

  return 'teal';
};

// Device revocation
const confirmRevoke = (device: AuthenticatedDevice) => {
  selectedDevice.value = device;
  confirmDialog.value = true;
};

const revokeDevice = async () => {
  if (!selectedDevice.value) return;

  revoking.value = true;
  try {
    // Store the current device ID to avoid logging out current session
    const currentDeviceId = String(selectedDevice.value.id);

    await profileStore.revokeDevice(currentDeviceId);

    // Close the dialog
    confirmDialog.value = false;
    selectedDevice.value = null;

    // Refresh the devices list to get updated data
    await profileStore.fetchAuthenticatedDevices();

  } catch (err) {
    console.error('Error revoking device:', err);
    // Error already handled by store
  } finally {
    revoking.value = false;
  }
};

// Logout from all devices
const handleLogoutAll = async () => {
  try {
    await profileStore.logoutAllDevices();

    // Clear authentication data
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');

    // Clear auth store
    authStore.token = null;

    // Navigate to login page
    await router.replace('/auth/login');
  } catch {
    // Error already handled by store
    // Even if the API call fails, clear local data and redirect
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    authStore.token = null;
    await router.replace('/auth/login');
  }
};
</script>

<style scoped lang="scss">
.devices-container {
  padding: 1.5rem;
}

.devices-icon {
  background: rgba(var(--q-primary-rgb), 0.1);
  padding: 1rem;
  border-radius: 50%;
}

.device-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-item {
  display: inline-flex;
  align-items: center;
}

.current-device {
  background: rgba(var(--q-primary-rgb), 0.05);
  border-left: 4px solid var(--q-primary);
}

.empty-state {
  padding: 3rem 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
}

.last-used {
  font-weight: 500;
}

.created-at {
  font-size: 0.7rem;
  opacity: 0.8;
}
</style>
