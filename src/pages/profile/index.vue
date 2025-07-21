<template>
  <q-page class="profile-page q-pa-md">
    <!-- Profile Header -->


    <!-- Main Profile Card with Tabs -->
    <q-card class="profile-card q-mt-lg">
      <q-card-section class="q-pb-none profile-content">
        <!-- User Info Summary -->
        <div class="row items-center q-pb-md user-summary">
          <div class="col-auto">
            <q-avatar :size="$q.screen.xs ? '60px' : '80px'">
              <img v-if="userProfile?.image" :src="userProfile.image" alt="Profile Photo">
              <q-icon v-else name="person" :size="$q.screen.xs ? '35px' : '50px'" color="grey-5" />
            </q-avatar>
          </div>
          <div class="col q-pl-md user-info">
            <div :class="$q.screen.xs ? 'text-h6' : 'text-h6'">{{ userProfile?.name || $t('profile.defaultUser') }}</div>
            <div class="text-subtitle2 text-grey-7">{{ userProfile?.username }}</div>
            <div class="user-meta q-mt-xs">
              <q-badge color="primary" :class="$q.screen.xs ? 'q-mr-xs text-caption' : 'q-mr-sm'">{{ userProfile?.role || $t('profile.defaultUser') }}</q-badge>
              <q-badge color="secondary" :class="$q.screen.xs ? 'text-caption' : ''">{{ userProfile?.gender || $t('profile.unknownGender') }}</q-badge>
            </div>
          </div>
        </div>

        <!-- Vertical Tabs -->
        <div class="row q-mt-md">
          <div class="col-12 col-md-3">
            <q-tabs
              v-model="activeTab"
              :vertical="$q.screen.gt.xs"
              class="text-primary profile-tabs"
              active-color="primary"
              indicator-color="primary"
              no-caps
              :shrink="$q.screen.gt.xs"
              switch-indicator
              :align="$q.screen.xs ? 'justify' : 'left'"
            >
              <q-tab name="profile" icon="person" :label="$q.screen.xs ? '' : $t('profile.personalInfo')" />
              <q-tab name="image" icon="photo_camera" :label="$q.screen.xs ? '' : $t('profile.profileImage')" />
              <q-tab name="password" icon="vpn_key" :label="$q.screen.xs ? '' : $t('profile.security')" />
              <q-tab name="devices" icon="devices" :label="$q.screen.xs ? '' : $t('profile.devices')" />
            </q-tabs>
          </div>

          <div class="col-12 col-md-9">
            <q-separator vertical inset v-if="$q.screen.gt.xs" class="q-mr-md" />
            <q-separator v-else class="q-mb-md" />

            <q-tab-panels v-model="activeTab" animated swipeable class="transparent">
              <q-tab-panel name="profile" :class="$q.screen.xs ? 'q-pa-xs' : ''">
                <UpdateProfile />
              </q-tab-panel>

              <q-tab-panel name="image" :class="$q.screen.xs ? 'q-pa-xs' : ''">
                <ProfileImageUpload />
              </q-tab-panel>

              <q-tab-panel name="password" :class="$q.screen.xs ? 'q-pa-xs' : ''">
                <ChangePassword />
              </q-tab-panel>

              <q-tab-panel name="devices" :class="$q.screen.xs ? 'q-pa-xs' : ''">
                <Devices />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from 'src/stores/profileStore';

// Components imports

import UpdateProfile from 'src/components/profile/UpdateProfile.vue';
import ProfileImageUpload from 'src/components/profile/ProfileImageUpload.vue';
import ChangePassword from 'src/components/profile/ChangePassword.vue';
import Devices from 'src/components/profile/Devices.vue';


const $q = useQuasar();
const { t: _t } = useI18n();
const profileStore = useProfileStore();

// Reactive state
const activeTab = ref('profile');
const userProfile = computed(() => profileStore.userProfile);

// Fetch user profile data on component mount
onMounted(async () => {
  // Only fetch if not already loaded to prevent duplicate API calls
  if (!userProfile.value) {
    try {
      await profileStore.fetchUserProfile();
    } catch {
      // Error already handled by store
    }
  }
});
</script>

<style scoped lang="scss">
.profile-page {
  background-color: #f7f9fc;
  min-height: 100vh;

  // Mobile adjustments
  @media (max-width: 767px) {
    padding: 8px !important;
  }
}

.profile-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 767px) {
    border-radius: 12px;
    margin-top: 8px !important;
  }
}

.profile-content {
  @media (max-width: 767px) {
    padding: 12px !important;
  }
}

.user-summary {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;

  @media (max-width: 767px) {
    padding-bottom: 1rem;

    .user-info {
      padding-left: 12px !important;

      .text-h6 {
        font-size: 1.1rem;
        line-height: 1.3;
      }

      .text-subtitle2 {
        font-size: 0.85rem;
        margin-top: 2px;
      }
    }

    .user-meta {
      margin-top: 6px !important;

      .q-badge {
        font-size: 0.75rem;
        padding: 4px 8px;
      }
    }
  }
}

.profile-tabs {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);

  .q-tab {
    padding: 12px 16px;
    justify-content: flex-start;
    border-radius: 8px;
    margin: 4px;

    &.q-tab--active {
      background: rgba(var(--q-primary-rgb), 0.1);
      font-weight: 500;
    }
  }

  // Mobile horizontal tabs
  @media (max-width: 767px) {
    .q-tab {
      padding: 8px 4px;
      margin: 2px;
      min-height: 48px;
      flex-direction: column;
      justify-content: center;

      .q-icon {
        margin-bottom: 2px;
        font-size: 18px;
      }
    }
  }
}

.transparent {
  background: transparent;
}

/* For small screens, make tabs horizontal */
@media (max-width: 767px) {
  .profile-tabs {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 12px;

    .q-tab {
      flex: 1;
    }
  }

  .q-tab-panels {
    .q-tab-panel {
      padding: 0 !important;
    }
  }
}
</style>
