// src/composables/notify.ts
import { Notify } from 'quasar'

export const showNotify = ({
  message,
  type = 'positive',
  duration = 2500,
  position = 'top'
}: {
  message: string
  type?: 'positive' | 'negative' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'center'
}) => {
  Notify.create({
    message,
    type,
    position,
    timeout: duration,
    actions: [{ icon: 'close', color: 'white' }]
  })
}
