import axios from 'axios';
import { supabase } from '@/lib/supabase';

interface DiagnosticResult {
  success: boolean;
  name: string;
  message: string;
  details?: any;
}

export async function performNetworkDiagnostics(): Promise<{
  success: boolean;
  results: DiagnosticResult[]
}> {
  console.log('🌐 Starting Comprehensive Network Diagnostics...');

  const diagnosticTests: Array<() => Promise<DiagnosticResult>> = [
    async () => {
      try {
        const response = await axios.get('/supabase/rest/v1/profiles', {
          baseURL: import.meta.env.VITE_SUPABASE_URL,
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Origin': window.location.origin
          }
        });

        return {
          success: true,
          name: 'Supabase REST API',
          message: 'REST API connection successful',
          details: response.data
        };
      } catch (error) {
        return {
          success: false,
          name: 'Supabase REST API',
          message: 'REST API connection failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .single();

        if (error) {
          return {
            success: false,
            name: 'Supabase Client Query',
            message: 'Query failed',
            details: error
          };
        }

        return {
          success: true,
          name: 'Supabase Client Query',
          message: 'Query successful',
          details: data
        };
      } catch (error) {
        return {
          success: false,
          name: 'Supabase Client Query',
          message: 'Client query failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    async () => {
      try {
        const response = await axios.options('/supabase/rest/v1/profiles', {
          baseURL: import.meta.env.VITE_SUPABASE_URL,
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET'
          }
        });

        return {
          success: response.status === 200,
          name: 'CORS Preflight Check',
          message: 'CORS preflight check passed',
          details: response.headers
        };
      } catch (error) {
        return {
          success: false,
          name: 'CORS Preflight Check',
          message: 'CORS preflight check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  ];

  const results = await Promise.all(
    diagnosticTests.map(async (test) => {
      const result = await test();
      console.log(`🔍 ${result.name}:`, result.success ? '✅ Passed' : '❌ Failed');
      return result;
    })
  );

  const overallSuccess = results.every(result => result.success);

  return {
    success: overallSuccess,
    results
  };
}

// Auto-run diagnostics in development
if (import.meta.env.DEV) {
  performNetworkDiagnostics().then(result => {
    console.log('🌐 Network Diagnostics Complete:', result);
  });
}
