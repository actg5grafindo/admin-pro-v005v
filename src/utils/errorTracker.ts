// Comprehensive Error Tracking and Reporting

export function setupErrorTracking() {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('🚨 Global Error Caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise
    });
    
    // Optional: Send to error tracking service
    // trackError(event.reason);
  });

  // Performance and resource error tracking
  window.addEventListener('resourceerror', (event) => {
    console.warn('⚠️ Resource Loading Error:', {
      target: (event.target as any).src || (event.target as any).href,
      tagName: (event.target as any).tagName
    });
  });
}

// Optional: Error reporting function (can be integrated with services like Sentry)
export function trackError(error: any, context?: Record<string, any>) {
  const errorPayload = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context: context || {}
  };

  console.error('📝 Error Tracked:', errorPayload);
  
  // Uncomment and configure for actual error tracking service
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { extra: context });
  // }
}

// Initialize error tracking
setupErrorTracking();
