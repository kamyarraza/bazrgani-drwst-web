<template>
  <div class="update-profile-container">
    <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
      <!-- Profile Form Header -->
      <div class="form-header q-mb-lg">
        <q-icon name="edit" size="md" color="primary" />
        <h6 class="q-ma-none q-ml-sm">{{ $t('profile.updatePersonalInfo') }}</h6>
      </div>

      <!-- Profile Form -->
      <div class="row q-col-gutter-md">
        <!-- Name -->
        <div class="col-12 col-md-6">
          <Qinput
            v-model="form.name"
            :label="$t('profile.name')"
            :rules="[val => !!val || $t('validation.required')]"
            outlined
            class="enhanced-input"
          >
            <template #before>
              <q-icon name="person" color="primary" />
            </template>
          </Qinput>
        </div>

        <!-- Username -->
        <div class="col-12 col-md-6">
          <Qinput
            v-model="form.username"
            :label="$t('profile.username')"
            :rules="[val => !!val || $t('validation.required')]"
            outlined
            class="enhanced-input"
          >
            <template #before>
              <q-icon name="alternate_email" color="primary" />
            </template>
          </Qinput>
        </div>

        <!-- Gender/Is Male -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="form.is_male"
            :options="genderOptions"
            :label="$t('profile.gender')"
            outlined
            emit-value
            map-options
            class="enhanced-input"
          >
            <template #before>
              <q-icon name="wc" color="primary" />
            </template>
          </q-select>
        </div>

        <!-- Phone -->
        <div class="col-12 col-md-6">
          <Qinput
            v-model="form.phone"
            :label="$t('profile.phone')"
            :rules="[val => !!val || $t('validation.required')]"
            outlined
            class="enhanced-input"
          >
            <template #before>
              <q-icon name="phone" color="primary" />
            </template>
          </Qinput>
        </div>



        <!-- Submit Button -->
        <div class="col-12 flex justify-center q-mt-lg">
          <Qbtn
            :btn-label="$t('profile.saveChanges')"
            type="submit"
            :isLoading="loading"
            btnColor="primary"
            class="update-profile-btn"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProfileStore } from 'src/stores/profileStore';
import Qinput from 'src/components/common/Qinput.vue';
import Qbtn from 'src/components/common/Qbtn.vue';
import type { UpdateProfileRequest } from 'src/types/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const profileStore = useProfileStore();
const loading = computed(() => profileStore.loading);
const userProfile = computed(() => profileStore.userProfile);

// Form data
const form = ref<UpdateProfileRequest>({
  name: '',
  is_male: true,
  phone: '',
  username: '',
  password: ''
});

// Gender options
const genderOptions = [
  { label: t('profile.male'), value: true },
  { label: t('profile.female'), value: false }
];

// Lifecycle hooks
onMounted(async () => {
  // Only fetch if not already loaded to prevent duplicate API calls
  if (!userProfile.value) {
    try {
      await profileStore.fetchUserProfile();
    } catch {
      // Error already handled by store
    }
  }

  // Initialize form with user data
  if (userProfile.value) {
    form.value = {
      name: userProfile.value.name,
      is_male: userProfile.value.gender === 'Male',
      phone: userProfile.value.phone,
      username: userProfile.value.username,
      password: ''
    };
  }
});

// Methods
const handleSubmit = async () => {
  try {
    // Update profile info only
    await profileStore.updateProfile(form.value);
  } catch {
    // Error already handled by store
  }
};
</script>

<style scoped lang="scss">
.update-profile-container {
  padding: 1.5rem;

  @media (max-width: 767px) {
    padding: 0.5rem;
  }
}

.form-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.1), rgba(var(--q-primary-rgb), 0.05));
  border-radius: 12px;
  border-left: 4px solid var(--q-primary);

  h6 {
    font-weight: 600;
    color: var(--q-dark);
  }

  @media (max-width: 767px) {
    padding: 0.75rem;
    margin-bottom: 1rem !important;

    h6 {
      font-size: 1.1rem;
    }

    .q-icon {
      font-size: 20px;
    }
  }
}

.enhanced-input {
  .q-field__control {
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  &.q-field--focused .q-field__control {
    box-shadow: 0 4px 12px rgba(var(--q-primary-rgb), 0.3);
  }

  @media (max-width: 767px) {
    margin-bottom: 0.75rem;

    .q-field__control {
      border-radius: 8px;
    }

    .q-field__before {
      .q-icon {
        font-size: 18px;
      }
    }
  }
}

.update-profile-btn {
  min-width: 200px;
  background: linear-gradient(45deg, var(--q-primary), #667eea);
  border-radius: 25px;
  padding: 12px 32px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 15px rgba(var(--q-primary-rgb), 0.3);

  &:hover {
    background: linear-gradient(45deg, #667eea, var(--q-primary));
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--q-primary-rgb), 0.4);
  }

  @media (max-width: 767px) {
    min-width: 150px;
    padding: 10px 24px;
    font-size: 0.9rem;
    border-radius: 20px;

    &:hover {
      transform: none;
    }
  }
}

// Mobile responsive grid adjustments
@media (max-width: 767px) {
  .row.q-col-gutter-md {
    .col-12.col-md-6 {
      margin-bottom: 0.5rem;
    }

    .col-12.flex.justify-center.q-mt-lg {
      margin-top: 1.5rem !important;
    }
  }
}
</style>
