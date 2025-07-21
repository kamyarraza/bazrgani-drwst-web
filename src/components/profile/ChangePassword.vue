<template>
  <div class="change-password-container">
    <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
      <div class="row q-mb-lg">
        <div class="col-12 flex justify-center">
          <div class="lock-icon-wrapper">
            <q-icon name="lock" size="60px" color="primary" />
          </div>
        </div>
      </div>

      <!-- Current Password -->
      <Qinput
        v-model="form.current_password"
        :label="$t('profile.currentPassword')"
        type="password"
        :rules="[val => !!val || $t('validation.required')]"
        outlined
        class="enhanced-input"
      >
        <template #before>
          <q-icon name="key" color="primary" />
        </template>
      </Qinput>

      <!-- New Password -->
      <Qinput
        v-model="form.password"
        :label="$t('profile.newPassword')"
        type="password"
        :rules="[val => !!val || $t('validation.required')]"
        outlined
        class="enhanced-input"
      >
        <template #before>
          <q-icon name="lock" color="primary" />
        </template>
      </Qinput>

      <!-- Confirm Password -->
      <Qinput
        v-model="form.password_confirmation"
        :label="$t('profile.confirmPassword')"
        type="password"
        :rules="[
          val => !!val || $t('validation.required'),
          val => val === form.password || $t('validation.passwordsMatch')
        ]"
        outlined
        class="enhanced-input"
      >
        <template #before>
          <q-icon name="lock_reset" color="primary" />
        </template>
      </Qinput>

      <!-- Password Strength Indicator -->
      <div class="password-strength" v-if="form.password">
        <div class="text-caption">{{ $t('profile.passwordStrength') }}: {{ passwordStrength }}</div>
        <q-linear-progress
          :value="strengthValue"
          :color="strengthColor"
          size="sm"
          class="q-mt-xs"
        />
      </div>

      <!-- Password Requirements -->
      <div class="password-requirements q-my-md">
        <div class="text-caption">{{ $t('profile.passwordRequirements') }}:</div>
        <div class="text-caption q-mt-xs" :class="{ 'text-positive': form.password.length >= 8, 'text-negative': form.password && form.password.length < 8 }">
          <q-icon :name="form.password.length >= 8 ? 'check_circle' : 'cancel'" size="xs" class="q-mr-xs" />
          {{ $t('profile.minLength') }}
        </div>
        <div class="text-caption q-mt-xs" :class="{ 'text-positive': hasUpperCase, 'text-negative': form.password && !hasUpperCase }">
          <q-icon :name="hasUpperCase ? 'check_circle' : 'cancel'" size="xs" class="q-mr-xs" />
          {{ $t('profile.uppercase') }}
        </div>
        <div class="text-caption q-mt-xs" :class="{ 'text-positive': hasNumber, 'text-negative': form.password && !hasNumber }">
          <q-icon :name="hasNumber ? 'check_circle' : 'cancel'" size="xs" class="q-mr-xs" />
          {{ $t('profile.number') }}
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center q-mt-lg">
        <Qbtn
          :btn-label="$t('profile.changePassword')"
          type="submit"
          :isLoading="loading"
          btnColor="primary"
          class="change-password-btn"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProfileStore } from 'src/stores/profileStore';
import Qinput from 'src/components/common/Qinput.vue';
import Qbtn from 'src/components/common/Qbtn.vue';
import type { ChangePasswordRequest } from 'src/types/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const profileStore = useProfileStore();
const loading = computed(() => profileStore.loading);

// Form data
const form = ref<ChangePasswordRequest>({
  current_password: '',
  password: '',
  password_confirmation: ''
});

// Password strength computed properties
const hasUpperCase = computed(() => /[A-Z]/.test(form.value.password));
const hasNumber = computed(() => /[0-9]/.test(form.value.password));

const strengthValue = computed(() => {
  if (!form.value.password) return 0;

  let strength = 0;

  // Check length
  if (form.value.password.length >= 8) strength += 0.34;

  // Check for uppercase
  if (hasUpperCase.value) strength += 0.33;

  // Check for numbers
  if (hasNumber.value) strength += 0.33;

  return strength;
});

const strengthColor = computed(() => {
  const value = strengthValue.value;
  if (value < 0.34) return 'negative';
  if (value < 0.67) return 'warning';
  return 'positive';
});

const passwordStrength = computed(() => {
  const value = strengthValue.value;
  if (value < 0.34) return t('profile.weak');
  if (value < 0.67) return t('profile.medium');
  return t('profile.strong');
});

// Methods
const handleSubmit = async () => {
  try {
    await profileStore.changePassword(form.value);
    // Reset form after successful change
    form.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    };
  } catch {
    // Error already handled by store
  }
};
</script>

<style scoped lang="scss">
.change-password-container {
  padding: 1.5rem;
}

.lock-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--q-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.password-strength {
  margin-top: 1rem;
}

.password-requirements {
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
}

.change-password-btn {
  min-width: 200px;
}
</style>
