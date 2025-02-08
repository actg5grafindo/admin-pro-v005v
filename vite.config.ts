import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Explicitly set IPv4 resolution
dns.setDefaultResultOrder('ipv4first');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',  // Explicitly set base path
    server: {
      port: 5050,
      host: true,
      strictPort: true,
      cors: {
        origin: [
          'http://localhost:5050',
          'https://admin-pro-two.vercel.app',
          'https://ixtjeocobjqcqladeaqg.supabase.co',
          '*'  // Be cautious with this in production
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Content-Type', 
          'Authorization', 
          'X-Requested-With', 
          'x-api-key',
          'Range',
          'If-Range',
          'Origin'
        ],
        credentials: true,
        maxAge: 86400
      },
      proxy: {
        '/supabase': {
          target: process.env.VITE_SUPABASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('Origin', req.headers.origin || 'http://localhost:5050');
              proxyReq.setHeader('Access-Control-Request-Method', req.method || 'GET');
              proxyReq.setHeader('apikey', process.env.VITE_SUPABASE_ANON_KEY);
              proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`);
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
            });
          }
        }
      }
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
      'import.meta.env.VITE_APP_DOMAIN': JSON.stringify(env.VITE_APP_DOMAIN),
      'process.env': {
        RESEND_API_KEY: JSON.stringify(env.RESEND_API_KEY),
        RESEND_FROM_EMAIL: JSON.stringify(env.RESEND_FROM_EMAIL),
        // ... other environment variables
      }
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Add these to handle node-specific modules in browser
        'process': 'process/browser',
        'buffer': 'buffer',
      },
      // Ensure browser-compatible versions of modules
      browserField: true,
      mainFields: ['browser', 'module', 'main'],
    },
    optimizeDeps: {
      // Specify modules to pre-bundle
      include: ['winston'],
      exclude: ['nodemailer'],
      esbuildOptions: {
        // Add defines for esbuild
        define: {
          'process.env': '{}',
        },
      },
    },
  };
});
