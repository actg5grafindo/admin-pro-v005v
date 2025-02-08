// Proxy Configuration Utility

export function configureProxy() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    console.error('❌ Supabase URL not configured');
    return null;
  }

  // Create a proxy configuration object
  const proxyConfig = {
    target: supabaseUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/supabase': ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add custom headers
      proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:5050');
      proxyReq.setHeader('Access-Control-Request-Method', req.method);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    }
  };

  console.log('🌐 Proxy Configuration:', {
    target: proxyConfig.target,
    changeOrigin: proxyConfig.changeOrigin
  });

  return proxyConfig;
}

// Auto-run proxy configuration in development
if (import.meta.env.DEV) {
  configureProxy();
}
