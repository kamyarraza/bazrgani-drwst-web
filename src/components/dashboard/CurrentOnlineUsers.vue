<template>
  <q-card class="online-users-card equal-height-card">
    <q-card-section class="q-pb-none">
      <div class="card-header">
        <div class="header-icon-wrapper">
          <q-icon name="online_prediction" size="2rem" color="positive" />
          <div class="online-pulse"></div>
        </div>
        <h6 class="card-title q-mb-none q-ml-md">{{ $t('dashboard.onlineUsers') }}</h6>

        <hr>

        <!-- <q-badge color="positive" outline rounded class="live-badge">
                <q-icon name="fiber_manual_record" size="0.6rem" class="q-mr-xs" />
                LIVE
              </q-badge> -->
      </div>
    </q-card-section>

    <q-card-section class="online-users-content">
      <!-- User Avatars Grid -->
      <div class="users-avatars-section">
        <!-- <div class="section-title q-mb-md">
                <q-icon name="people" size="1.2rem" color="primary" class="q-mr-xs" />
                {{ $t('dashboard.activeNow') }}
              </div> -->

        <div v-for="(user, index) in users?.slice(0, 8)" :key="index" class="user-avatar-item"
          :style="{ animationDelay: `${index * 0.1}s` }">
          <q-avatar size="40px" class="user-avatar">
            <q-img v-if="user.image" :src="user.image" :alt="user.name" class="user-avatar-img" />
            <q-icon v-else name="person" size="1.2rem" color="red" />
            <div class="online-dot"></div>
          </q-avatar>
          <div class="user-name">{{ user.name?.split(' ')[0] || 'User' }}</div>
          <q-chip dense size="sm" :color="user.type === 'admin' ? 'deep-purple' : 'pink'" text-color="white"
            class="user-type-chip">
            {{ user.type }}
          </q-chip>
          <q-badge color="grey-6" class="last-activity-badge">
            {{ user.last_activity_at?.humans || 'Just now' }}
          </q-badge>
        </div>

        <!-- More users indicator -->
        <div v-if="onlineUsersCount > 8" class="more-users-indicator">
          <q-avatar size="40px" class="more-avatar">
            <div class="more-count">+{{ onlineUsersCount - 8 }}</div>
          </q-avatar>
          <div class="user-name">{{ $t('dashboard.more') }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';


interface OnlineUsers {
  image: string;
  name: string;
  type: string;
  is_online: boolean;
  last_activity_at: {
    datetime: string;
    humans: string;
  };
}

interface Props {
  online_users: OnlineUsers[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const users = computed(() => {
  return props.online_users
})

const onlineUsersCount = computed(() => {
  return props.online_users?.length || 0;
})
</script>

<style lang="scss">
.users-avatars-section {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
}

.user-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px) scale(1.05) !important;
    background: rgba(116, 58, 213, 0.1) !important;
    box-shadow: 0 8px 25px rgba(116, 58, 213, 0.15) !important;
  }

  .user-avatar {
    position: relative;
    border: 2px solid #e8f5e8;
    transition: all 0.3s ease;

    .online-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: linear-gradient(45deg, #4caf50, #8bc34a);
      border: 2px solid white;
      border-radius: 50%;
      animation: pulse 2s infinite;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  &:hover .user-avatar {
      box-shadow: 0 0 0 4px rgba(120, 60, 148, 0.2);
    }

  .user-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #555;
    text-align: center;
    transition: color 0.3s ease;
  }

  &:hover .user-name {
    color: #743ad5;
    font-weight: 600;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.more-avatar {
  background: #f0f0f0;
  border: 2px solid #e0e0e0;

  .more-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: #555;
  }
}

.user-type-chip {
  font-size: 0.7rem;
  color: #999;
  margin-top: 2px;
}

.last-activity-badge {
  font-size: 0.65rem;
  color: #fff;
  margin-top: 2px;
  padding-top: 4px;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>