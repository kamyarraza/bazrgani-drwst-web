import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  // Global error handler for unhandled Vue errors
  app.config.errorHandler = (err: unknown, instance, info) => {
    console.error('Global Vue Error Handler:', err, info);

    // Log error details for debugging
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }

    // You can send this to an error tracking service here
    // Example: Sentry.captureException(err);

    // For auth-related errors, ensure cleanup happens
    if (err instanceof Error &&
        (err.message.toLowerCase().includes('unauthenticated') ||
         err.message.toLowerCase().includes('unauthorized') ||
         err.message.toLowerCase().includes('token'))) {

      // Clear any potentially corrupted auth state
      try {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_remember');
        localStorage.removeItem('auth_session_expiry');
        localStorage.removeItem('auth_last_activity');
      } catch {
        // Ignore localStorage errors
      }

      // Redirect to login if not already there
      if (typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    }
  };

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);

    // Handle auth-related promise rejections
    if (event.reason &&
        typeof event.reason === 'object' &&
        'message' in event.reason &&
        typeof event.reason.message === 'string') {

      const message = event.reason.message.toLowerCase();
      if (message.includes('unauthenticated') ||
          message.includes('unauthorized') ||
          message.includes('token')) {

        // Clear auth state and redirect
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_remember');
          localStorage.removeItem('auth_session_expiry');
          localStorage.removeItem('auth_last_activity');
        } catch {
          // Ignore localStorage errors
        }

        if (typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }

    // Prevent the default browser error handling for auth errors
    if (event.reason &&
        typeof event.reason === 'string' &&
        (event.reason.toLowerCase().includes('unauthenticated') ||
         event.reason.toLowerCase().includes('unauthorized'))) {
      event.preventDefault();
    }
  });

  // Global error event handler for JavaScript errors
  window.addEventListener('error', (event) => {
    // console.error('Global JavaScript Error:', event.error);

    // Handle auth-related JavaScript errors
    if (event.error &&
        event.error.message &&
        typeof event.error.message === 'string') {

      const message = event.error.message.toLowerCase();
      if (message.includes('unauthenticated') ||
          message.includes('unauthorized') ||
          message.includes('token')) {

        // Clear auth state and redirect
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_remember');
          localStorage.removeItem('auth_session_expiry');
          localStorage.removeItem('auth_last_activity');
        } catch {
          // Ignore localStorage errors
        }

        if (typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
  });
});
