<template>
  <div class="session-history">
    <div class="sessions-header">
      <h6>{{ t('cashbox.sessionHistory', 'Session History') }}</h6>
      <q-btn flat round icon="refresh" size="sm" @click="$emit('refresh')" :loading="loading" color="primary">
        <q-tooltip>{{ t('cashbox.refresh', 'Refresh') }}</q-tooltip>
      </q-btn>
    </div>

    <div class="sessions-content">
      <template v-if="sessions && sessions.length > 0">
        <div class="sessions-list">
          <div v-for="(session, index) in reversedSessions" :key="index" class="session-item"
            :class="{ 'current-session': !session.closed_at }">
            <div class="session-status-indicator">
              <div class="status-dot" :class="session.closed_at ? 'closed' : 'active'"></div>
            </div>

            <div class="session-details">
              <div class="session-header">
                <div class="session-date">
                  <q-icon name="calendar_today" size="18px" />
                  {{ formatDate(session.date) }}
                </div>
                <q-chip :color="session.closed_at ? 'grey-6' : 'positive'" text-color="white" size="sm"
                  :icon="session.closed_at ? 'lock' : 'lock_open'">
                  {{ session.closed_at ? t('cashbox.sessionClosed', 'Closed') : t('cashbox.sessionActive', 'Active') }}
                </q-chip>
              </div>

              <div class="session-info">
                <div class="session-user-info">
                  <div class="opened-info">
                    <q-icon name="login" size="16px" color="green-6" />
                    <span class="label">{{ t('cashbox.openedBy', 'Opened By') }}:</span>
                    <span class="value">{{ session.opened_by.name }}</span>
                    <span class="time">{{ formatTime(session.opened_at) }}</span>
                  </div>

                  <div v-if="session.closed_at" class="closed-info">
                    <q-icon name="logout" size="16px" color="red-6" />
                    <span class="label">{{ t('cashbox.closedBy', 'Closed By') }}:</span>
                    <span class="value">{{ session.closed_by?.name || 'N/A' }}</span>
                    <span class="time">{{ formatTime(session.closed_at) }}</span>
                  </div>
                </div>

                <div class="session-balances">
                  <div class="balance-row">
                    <div class="balance-item opening">
                      <span class="balance-label">{{ t('cashbox.openingBalance', 'Opening Balance') }}</span>
                      <div class="balance-amounts">
                        <span class="iqd-balance">{{ formatCurrency(session.iqd_opening_balance, 'IQD') }}</span>
                        <span class="usd-balance">{{ formatCurrency(session.usd_opening_balance, 'USD') }}</span>
                      </div>
                    </div>

                    <div v-if="session.closed_at" class="balance-item closing">
                      <span class="balance-label">{{ t('cashbox.closingBalance', 'Closing Balance') }}</span>
                      <div class="balance-amounts">
                        <span class="iqd-balance">{{ formatCurrency(session.iqd_closing_balance, 'IQD') }}</span>
                        <span class="usd-balance">{{ formatCurrency(session.usd_closing_balance, 'USD') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="no-sessions">
          <div class="no-sessions-icon">
            <q-icon name="history" size="4rem" color="grey-4" />
          </div>
          <h6>{{ t('cashbox.noSessions', 'No sessions found') }}</h6>
          <p>{{ t('cashbox.noSessionsDesc', 'No cashbox sessions have been recorded yet') }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatCurrency } from 'src/composables/useFormat';
import type { CashboxSession } from 'src/types/cashbox';

const props = defineProps<{
  sessions?: CashboxSession[] | undefined;
  loading?: boolean;
}>();

defineEmits(['refresh']);

const { t } = useI18n();

// Reverse sessions to show most recent first
const reversedSessions = computed(() => {
  if (!props.sessions) return [];
  return [...props.sessions].reverse();
});

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}
</script>

<style lang="scss" scoped>
.session-history {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.sessions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;

  h6 {
    margin: 0;
    color: #475569;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }
  }
}

.sessions-content {
  padding: 16px 0;
  max-height: 500px;
  overflow-y: auto;
}

.sessions-list {
  .session-item {
    display: flex;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    &:last-child {
      border-bottom: none;
    }

    &.current-session {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.03) 100%);
      border-left: 4px solid #10b981;
    }
  }

  .session-status-indicator {
    flex-shrink: 0;
    padding-top: 4px;

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;

      &.active {
        background: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        animation: pulse-dot 2s infinite;
      }

      &.closed {
        background: #9ca3af;
      }
    }
  }

  .session-details {
    flex: 1;

    .session-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .session-date {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .session-info {
      .session-user-info {
        margin-bottom: 16px;

        .opened-info,
        .closed-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 0.9rem;

          .label {
            color: #6b7280;
            font-weight: 500;
          }

          .value {
            color: #1f2937;
            font-weight: 600;
          }

          .time {
            color: #9ca3af;
            font-size: 0.85rem;
            margin-left: auto;
          }
        }
      }

      .session-balances {
        .balance-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .balance-item {
            padding: 12px;
            border-radius: 8px;

            &.opening {
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            }

            &.closing {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            }

            .balance-label {
              display: block;
              font-size: 0.8rem;
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
            }

            .balance-amounts {
              display: flex;
              flex-direction: column;
              gap: 4px;

              .iqd-balance,
              .usd-balance {
                font-weight: 700;
                font-size: 0.9rem;
              }

              .iqd-balance {
                color: #d97706;
              }

              .usd-balance {
                color: #059669;
              }
            }
          }
        }
      }
    }
  }
}

.no-sessions {
  text-align: center;
  padding: 40px 24px;
  color: #6b7280;

  .no-sessions-icon {
    margin-bottom: 16px;
  }

  h6 {
    margin: 0 0 8px 0;
    color: #9ca3af;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

// Responsive
@media (max-width: 768px) {
  .sessions-content {
    max-height: 400px;
  }

  .session-item {
    padding: 16px 16px !important;
    gap: 12px !important;

    .session-info {
      .balance-row {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      .session-user-info {

        .opened-info,
        .closed-info {
          flex-wrap: wrap;
          gap: 4px !important;

          .time {
            margin-left: 0 !important;
            width: 100%;
            text-align: left;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .sessions-header {
    padding: 16px 16px !important;
  }

  .session-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px;
  }
}
</style>
