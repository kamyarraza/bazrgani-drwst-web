# Admin Notification Sender Component

A comprehensive Vue 3 component for sending notifications to different user groups in the ERP system. This component is designed specifically for admin users to broadcast important messages across the organization.

## Features

### 🎯 **Recipient Targeting**
- **All Users**: Send to everyone in the system
- **Administrators**: Target system administrators only
- **Employees**: Send to regular employees
- **Accountants**: Target accounting department specifically

### 📋 **Rich Content Support**
- **Title**: Required notification title (max 100 characters)
- **Description**: Detailed notification content (max 500 characters)
- **Priority Levels**: 
  - Low Priority (General information)
  - Normal Priority (Standard notification)
  - High Priority (Important notification)
  - Urgent (Requires immediate attention)

### 🎨 **User Experience**
- **Live Preview**: See exactly how the notification will appear
- **Form Validation**: Real-time validation with helpful error messages
- **Recent Notifications**: Track the last 5 sent notifications
- **Responsive Design**: Works perfectly on desktop and mobile
- **RTL Support**: Full support for Arabic and Kurdish languages

### 🌍 **Internationalization**
- **English**: Complete translation set
- **Arabic**: Full RTL support with Arabic translations
- **Kurdish**: Complete Kurdish translation set

## Usage

### Basic Implementation

```vue
<template>
  <div>
    <!-- Simple usage -->
    <NotificationSender />
  </div>
</template>

<script setup lang="ts">
import NotificationSender from 'src/components/admin/NotificationSender.vue';
</script>
```

### Full Page Implementation

```vue
<template>
  <q-page class="admin-page">
    <div class="page-header">
      <h2>{{ t('admin.sendNotification.title') }}</h2>
    </div>
    <NotificationSender />
  </q-page>
</template>

<script setup lang="ts">
import NotificationSender from 'src/components/admin/NotificationSender.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```

## API Integration

The component expects a POST endpoint at `/admin/notifications/send` with the following payload:

```typescript
interface NotificationPayload {
  title: string;           // Required: Notification title
  description: string;     // Required: Notification description
  recipients: 'all' | 'admins' | 'employees' | 'accountants';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
```

### Expected Response

```typescript
// Success Response
{
  status: 'success',
  message: 'Notification sent successfully'
}

// Error Response
{
  status: 'error',
  message: 'Failed to send notification'
}
```

## Translation Keys

All translation keys are organized under `admin.sendNotification`:

```typescript
admin: {
  sendNotification: {
    title: 'Send Notification',
    subtitle: 'Send notifications to users across the system',
    recipients: 'Recipients',
    allUsers: 'All Users',
    // ... complete list in translation files
  }
}
```

## Styling

The component uses SCSS with the following design principles:

### Color Scheme
- **Primary**: `#1976d2` (Blue)
- **Secondary**: Various colors for different recipient types
- **Priority Colors**: 
  - Low: Blue (`#2196f3`)
  - Normal: Primary (`#1976d2`)
  - High: Orange (`#ff9800`)
  - Urgent: Red (`#f44336`)

### Responsive Breakpoints
- **Desktop**: Full layout with side-by-side elements
- **Tablet**: Adjusted spacing and grid layout
- **Mobile**: Stacked layout with full-width elements

## File Structure

```
src/
├── components/
│   └── admin/
│       └── NotificationSender.vue     # Main component
├── pages/
│   └── admin/
│       └── NotificationsPage.vue      # Example page implementation
└── i18n/
    ├── en-US/index.ts                 # English translations
    ├── ar/index.ts                    # Arabic translations
    └── ckb/index.ts                   # Kurdish translations
```

## Security Considerations

### Admin-Only Access
- This component should only be accessible to admin users
- Implement proper route guards and permission checks
- Validate user permissions on the backend

### Input Validation
- All inputs are validated on the frontend
- Implement backend validation for security
- Sanitize HTML content to prevent XSS

## Integration Example

### 1. Add to Router

```typescript
// router/routes.ts
{
  path: '/admin/notifications',
  name: 'AdminNotifications',
  component: () => import('src/pages/admin/NotificationsPage.vue'),
  meta: { 
    requiresAuth: true, 
    requiredRole: 'admin' 
  }
}
```

### 2. Add to Admin Menu

```vue
<q-item clickable @click="$router.push('/admin/notifications')">
  <q-item-section avatar>
    <q-icon name="notifications_active" />
  </q-item-section>
  <q-item-section>
    {{ t('admin.sendNotification.title') }}
  </q-item-section>
</q-item>
```

### 3. Backend Endpoint

```php
// Laravel example
Route::post('/admin/notifications/send', function (Request $request) {
    $request->validate([
        'title' => 'required|string|max:100',
        'description' => 'required|string|max:500',
        'recipients' => 'required|in:all,admins,employees,accountants',
        'priority' => 'required|in:low,normal,high,urgent'
    ]);

    // Send notification logic here
    
    return response()->json([
        'status' => 'success',
        'message' => 'Notification sent successfully'
    ]);
});
```

## Customization

### Custom Recipient Types

To add new recipient types, update:

1. **Component** (`NotificationSender.vue`):
```typescript
const recipientOptions = computed(() => [
  // ... existing options
  {
    label: t('admin.sendNotification.managers', 'Managers'),
    value: 'managers',
    slot: 'managers'
  }
]);
```

2. **Template** (add new slot):
```vue
<template v-slot:managers>
  <div class="recipient-option">
    <div class="recipient-icon managers">
      <q-icon name="supervisor_account" size="1.5rem" />
    </div>
    <div class="recipient-details">
      <div class="recipient-label">{{ t('admin.sendNotification.managers', 'Managers') }}</div>
      <div class="recipient-description">{{ t('admin.sendNotification.managersDesc', 'Send to department managers') }}</div>
    </div>
  </div>
</template>
```

3. **Translations**: Add to all language files

## Performance Considerations

- Component uses Vue 3 Composition API for optimal performance
- Reactive form validation prevents unnecessary API calls
- Recent notifications are stored locally to reduce API requests
- Lazy loading compatible for large applications

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **Mobile**: iOS 14+, Android 8+
- **IE**: Not supported (Vue 3 requirement)

## Dependencies

- Vue 3.0+
- Quasar Framework 2.0+
- Vue i18n
- Axios (for API calls)

This component provides a complete, production-ready solution for admin notification broadcasting with excellent UX and full internationalization support.
