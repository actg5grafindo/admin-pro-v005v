// CORS Configuration Utility

export function configureCORS() {
  // List of allowed origins
  const allowedOrigins = [
    'http://localhost:5050',
    'http://127.0.0.1:5050',
    'http://localhost:3000',
    'https://admin-pro-two.vercel.app'
  ];

  // Check if current origin is allowed
  const isOriginAllowed = () => {
    const currentOrigin = window.location.origin;
    return allowedOrigins.includes(currentOrigin);
  };

  // Log CORS configuration
  console.log('🌐 CORS Configuration:');
  console.log('Allowed Origins:', allowedOrigins);
  console.log('Current Origin:', window.location.origin);
  console.log('Origin Allowed:', isOriginAllowed());

  // Optional: Add headers to requests
  const addCORSHeaders = (headers: Headers) => {
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  };

  return {
    isOriginAllowed,
    addCORSHeaders
  };
}

// Auto-run CORS configuration in development
if (import.meta.env.DEV) {
  configureCORS();
}
