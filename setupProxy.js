const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

module.exports = function(app) {
  // Supabase Proxy Configuration
  app.use(
    '/supabase',
    createProxyMiddleware({
      target: process.env.VITE_SUPABASE_URL,
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
    })
  );

  // Optional: Additional proxy configurations
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true
    })
  );
};
