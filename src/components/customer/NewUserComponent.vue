<template>
  <q-dialog v-model="showModal" persistent>
    <q-card class="new-user-card">
      <!-- Success Header -->
      <q-card-section class="success-header">
        <div class="success-icon-wrapper">
          <q-icon name="account_circle" size="48px" color="white" />
          <div class="success-checkmark">
            <q-icon name="check_circle" size="20px" color="positive" />
          </div>
        </div>
        <h4 class="text-white text-center q-mt-md q-mb-none">
          {{ $t('customer.accountCreated', 'Account Created Successfully!') }}
        </h4>
        <p class="text-white text-center q-mt-sm opacity-90">
          {{ $t('customer.newUserAccountMessage', 'A new user account has been created for this customer') }}
        </p>
      </q-card-section>

      <!-- User Information Card -->
      <q-card-section class="user-info-section">
        <div class="user-info-card">
          <div class="user-avatar">
            <q-avatar size="80px" color="primary" text-color="white" class="user-avatar-icon">
              {{ userData?.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </q-avatar>
          </div>

          <div class="user-details">
            <h5 class="user-name">{{ userData?.user?.name || 'New User' }}</h5>
            <p class="user-subtitle">{{ $t('customer.newCustomerAccount', 'Customer Account') }}</p>

            <!-- Account Details -->
            <div class="account-details">
              <div class="detail-item">
                <q-icon name="person" color="primary" />
                <span class="detail-label">{{ $t('customer.username', 'Username') }}:</span>
                <span class="detail-value">{{ userData?.user?.username }}</span>
              </div>

              <!-- Only show password if present -->
              <div v-if="userData?.user?.password" class="detail-item password-item">
                <q-icon name="lock" color="primary" />
                <span class="detail-label">{{ $t('customer.password', 'Password') }}:</span>
                <div class="password-wrapper">
                  <span class="detail-value password-value">{{ userData?.user?.password }}</span>
                  <q-btn
                    flat
                    round
                    size="sm"
                    color="primary"
                    icon="content_copy"
                    @click="copyPassword"
                    class="copy-btn"
                  >
                    <q-tooltip>{{ $t('customer.copyPassword', 'Copy Password') }}</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div class="detail-item">
                <q-icon name="badge" color="primary" />
                <span class="detail-label">{{ $t('customer.id', 'ID') }}:</span>
                <span class="detail-value">#{{ userData?.user?.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning Banner -->
        <q-banner v-if="userData?.user?.password" class="warning-banner q-mt-lg" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="warning" />
          </template>
          <div class="warning-content">
            <div class="warning-title">{{ $t('customer.securityWarning', 'Important Security Notice') }}</div>
            <div class="warning-text">
              {{ $t('customer.passwordWarning', 'This password will only be displayed once. Please copy and securely share it with the customer immediately.') }}
            </div>
          </div>
        </q-banner>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="action-section">
        <q-btn
          v-if="userData?.user?.password"
          flat
          :label="$t('customer.copyCredentials', 'Copy All Credentials')"
          color="primary"
          icon="content_copy"
          @click="copyAllCredentials"
          class="copy-all-btn"
        />
        <q-space v-if="userData?.user?.password" />
        <q-btn
          unelevated
          :label="$t('common.close', 'Close')"
          color="primary"
          @click="closeModal"
          class="close-btn"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import type { Customer } from 'src/types/customer'

// Props
interface Props {
  modelValue: boolean
  userData: {
    user: {
      id: number
      name: string
      username: string
      password: string
    }
    customer: Customer
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  userData: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Composables
const { t } = useI18n()
const $q = useQuasar()

// Computed
const showModal = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Methods
const copyPassword = async () => {
  if (!props.userData?.user?.password) return

  try {
    await navigator.clipboard.writeText(props.userData.user.password)
    $q.notify({
      type: 'positive',
      message: t('customer.passwordCopied', 'Password copied to clipboard'),
      position: 'top',
      timeout: 2000,
      icon: 'content_copy'
    })
  } catch (err) {
    console.error('Failed to copy password:', err)
    $q.notify({
      type: 'negative',
      message: t('customer.copyFailed', 'Failed to copy password'),
      position: 'top',
      timeout: 2000
    })
  }
}

const copyAllCredentials = async () => {
  if (!props.userData?.user) return

  const credentials = `Customer Account Credentials
Name: ${props.userData.user.name}
Username: ${props.userData.user.username}
Password: ${props.userData.user.password}
User ID: #${props.userData.user.id}

⚠️ Important: Please change this password after first login for security.`

  try {
    await navigator.clipboard.writeText(credentials)
    $q.notify({
      type: 'positive',
      message: t('customer.credentialsCopied', 'All credentials copied to clipboard'),
      position: 'top',
      timeout: 3000,
      icon: 'content_copy'
    })
  } catch (err) {
    console.error('Failed to copy credentials:', err)
    $q.notify({
      type: 'negative',
      message: t('customer.copyFailed', 'Failed to copy credentials'),
      position: 'top',
      timeout: 2000
    })
  }
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped lang="scss">
.new-user-card {
  min-width: 400px;
  max-width: 480px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.13);
  background: linear-gradient(120deg, #f8fafc 60%, #e3f0ff 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.success-header {
  background: linear-gradient(135deg, var(--q-primary), #4f8cff 80%);
  padding: 0.7rem 0.5rem 0.4rem 0.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 24px 12px;
  border-bottom-right-radius: 24px 12px;
  box-shadow: 0 4px 12px rgba(79, 140, 255, 0.07);
}

.success-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 0.1rem;
}

.success-icon-wrapper .q-icon {
  font-size: 48px !important;
  width: 48px !important;
  height: 48px !important;
}

.success-checkmark {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: white;
  border-radius: 50%;
  padding: 1px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.13);
}

.user-info-section {
  padding: 1.2rem 0.7rem 1rem 0.7rem;
  background: #f6faff;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 1.2rem 0.7rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  border: 1px solid rgba(var(--q-primary-rgb), 0.07);
  transition: box-shadow 0.2s;
}

.user-avatar {
  margin-bottom: 1rem;
}

.user-avatar-icon {
  font-size: 1.3rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.18);
  border: 2px solid #e3f0ff;
}

.user-name {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--q-dark);
  letter-spacing: 0.2px;
}

.user-subtitle {
  margin: 0 0 1.1rem 0;
  color: var(--q-primary);
  font-weight: 500;
  font-size: 0.95rem;
  opacity: 0.85;
}

.account-details {
  text-align: left;
  max-width: 320px;
  margin: 0 auto;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.7rem 0.5rem;
  margin-bottom: 0.3rem;
  background: rgba(var(--q-primary-rgb), 0.015);
  border-radius: 8px;
  border: 1px solid rgba(var(--q-primary-rgb), 0.07);
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  font-size: 0.97rem;
}

.password-item {
  background: rgba(var(--q-positive-rgb), 0.015);
  border-color: rgba(var(--q-positive-rgb), 0.07);
}

.detail-label {
  font-weight: 600;
  color: var(--q-dark);
  min-width: 60px;
  opacity: 0.85;
  font-size: 0.97rem;
}

.detail-value {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--q-dark);
  flex: 1;
  font-size: 0.97rem;
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.password-value {
  background: rgba(var(--q-positive-rgb), 0.09);
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  font-weight: 700;
  color: var(--q-positive);
  letter-spacing: 0.5px;
  font-size: 0.97rem;
}

.copy-btn {
  min-width: auto;
  padding: 2px;
}

.warning-banner {
  background: linear-gradient(135deg,
    rgba(var(--q-warning-rgb), 0.09),
    rgba(var(--q-warning-rgb), 0.04)
  );
  border: 1px solid rgba(var(--q-warning-rgb), 0.13);
  .q-banner__content {
    padding: 0;
  }
}

.warning-content {
  .warning-title {
    font-weight: 700;
    color: var(--q-warning);
    font-size: 0.97rem;
    margin-bottom: 0.3rem;
  }
  .warning-text {
    color: var(--q-dark);
    font-size: 0.93rem;
    line-height: 1.4;
    opacity: 0.92;
  }
}

.action-section {
  padding: 1rem 0.7rem;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.copy-all-btn {
  font-weight: 600;
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  font-size: 0.97rem;
  background: linear-gradient(90deg, #e3f0ff 0%, #f8fafc 100%);
  box-shadow: 0 1px 4px rgba(var(--q-primary-rgb), 0.03);
}

.close-btn {
  font-weight: 700;
  padding: 0.4rem 1.3rem;
  border-radius: 7px;
  min-width: 90px;
  font-size: 0.97rem;
  background: linear-gradient(90deg, #f8fafc 0%, #e3f0ff 100%);
  box-shadow: 0 1px 4px rgba(var(--q-primary-rgb), 0.03);
}

// Mobile responsiveness
@media (max-width: 600px) {
  .new-user-card {
    min-width: 98vw;
    max-width: 99vw;
    margin: 0.5rem auto;
    border-radius: 10px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  .success-header {
    padding: 0.5rem 0.2rem 0.2rem 0.2rem;
    border-bottom-left-radius: 12px 6px;
    border-bottom-right-radius: 12px 6px;
  }
  .user-info-section {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .user-info_card {
    padding: 0.7rem 0.2rem;
  }
  .account-details {
    max-width: 100%;
  }
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    padding: 0.5rem 0.2rem;
    font-size: 0.93rem;
  }
  .password-wrapper {
    width: 100%;
  }
  .action-section {
    flex-direction: column;
    gap: 0.5rem;
    .copy-all-btn, .close-btn {
      width: 100%;
    }
  }
}
</style>
