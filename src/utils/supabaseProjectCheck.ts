import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Singleton pattern to prevent multiple initializations
class SupabaseDiagnostics {
  private static instance: SupabaseDiagnostics;
  private initialized = false;
  private diagnosticResult: any = null;

  private constructor() {}

  public static getInstance(): SupabaseDiagnostics {
    if (!SupabaseDiagnostics.instance) {
      SupabaseDiagnostics.instance = new SupabaseDiagnostics();
    }
    return SupabaseDiagnostics.instance;
  }

  public async performDiagnostics(forceRefresh = false): Promise<any> {
    // Return cached result if already initialized and not forced refresh
    if (!forceRefresh && this.initialized && this.diagnosticResult) {
      return this.diagnosticResult;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🔍 Comprehensive Supabase Project Diagnostics');
    console.log('-------------------------------------------');

    console.log(`🌐 Checking Supabase Project Configuration`);
    console.log(`📍 Project URL: ${supabaseUrl}`);
    console.log(`🔑 Anon Key: ${supabaseAnonKey ? 'PRESENT ✅' : 'MISSING ❌'}`);

    if (!supabaseUrl || !supabaseAnonKey) {
      const error = 'Missing Supabase Configuration';
      console.error(`❌ ${error}`);
      
      this.diagnosticResult = {
        configurationValid: false,
        error,
        details: {
          supabaseUrlPresent: !!supabaseUrl,
          supabaseAnonKeyPresent: !!supabaseAnonKey
        }
      };
      
      return this.diagnosticResult;
    }

    try {
      // Detailed network connectivity check
      console.log(`🌐 Checking URL: ${supabaseUrl}`);
      
      const networkDiagnostics: any = {
        urlParsed: false,
        headRequestAttempted: false,
        headRequestSuccessful: false,
        corsIssue: false
      };

      try {
        // Validate URL parsing
        new URL(supabaseUrl);
        networkDiagnostics.urlParsed = true;
      } catch (urlError) {
        console.error('❌ Invalid Supabase URL:', urlError);
        
        this.diagnosticResult = {
          configurationValid: false,
          error: 'Invalid Supabase URL',
          details: {
            urlError: urlError instanceof Error ? urlError.message : String(urlError)
          }
        };
        
        return this.diagnosticResult;
      }

      // Enhanced Network Connectivity Check with Multiple Strategies
      const networkCheckStrategies = [
        async () => {
          try {
            const response = await fetch(supabaseUrl, { 
              method: 'HEAD', 
              mode: 'cors',
              headers: {
                'Accept': 'application/json'
              }
            });
            
            networkDiagnostics.headRequestAttempted = true;
            
            if (response.ok) {
              networkDiagnostics.headRequestSuccessful = true;
            } else {
              console.warn('⚠️ HEAD Request Failed:', {
                status: response.status,
                statusText: response.statusText
              });
            }
          } catch (fetchError) {
            networkDiagnostics.corsIssue = true;
            console.warn('⚠️ CORS/Network Connectivity Check Failed:', fetchError);
          }
        },
        async () => {
          try {
            const response = await fetch(supabaseUrl, { 
              method: 'GET', 
              mode: 'no-cors'
            });
            console.log('No-CORS request succeeded');
          } catch (noCorsError) {
            console.warn('⚠️ No-CORS Request Failed:', noCorsError);
          }
        }
      ];

      // Run network check strategies
      for (const strategy of networkCheckStrategies) {
        await strategy();
      }

      // If network checks fail, return detailed diagnostics
      if (!networkDiagnostics.headRequestSuccessful) {
        this.diagnosticResult = {
          configurationValid: false,
          error: 'Network Connectivity Issue',
          details: {
            ...networkDiagnostics,
            timestamp: new Date().toISOString(),
            environment: import.meta.env.MODE,
            possibleCauses: [
              'Invalid Supabase URL',
              'Network connectivity problems',
              'CORS configuration missing',
              'Firewall or security settings blocking request'
            ],
            recommendations: [
              'Verify Supabase project URL',
              'Check network connectivity',
              'Configure CORS in Supabase dashboard',
              'Ensure no firewall is blocking the request'
            ]
          }
        };
        
        return this.diagnosticResult;
      }

      // Create Supabase client
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false  // Disable persistent session for diagnostics
        }
      });

      // Authentication and Schema Validation
      let authConfigRetrieved = false;
      let schemaValidationPassed = false;
      let missingColumns: string[] = [];
      let missingOptionalColumns: string[] = [];

      try {
        // Try to get a sample row
        const requiredColumns = ['id', 'full_name', 'email', 'username'];
        const optionalColumns = ['email_verified', 'phone_number', 'language'];
        
        const selectColumns = [...requiredColumns, ...optionalColumns].join(', ');
        
        const { data: sampleRow, error } = await supabase
          .from('profiles')
          .select(selectColumns)
          .limit(1)
          .single();

        if (error) {
          console.warn('⚠️ Schema validation encountered an error:', error);
          missingColumns = requiredColumns;
          
          // Detailed error analysis
          if (error.code === 'PGRST116') {
            console.warn('No rows returned. This might indicate an empty table or incorrect table name.');
          }
        } else {
          // Check for missing required columns
          missingColumns = requiredColumns.filter(
            col => !(col in (sampleRow || {}))
          );

          // Check for missing optional columns
          missingOptionalColumns = optionalColumns.filter(
            col => !(col in (sampleRow || {}))
          );

          schemaValidationPassed = missingColumns.length === 0;
          authConfigRetrieved = true;
        }
      } catch (schemaError) {
        console.error('❌ Unexpected Schema Validation Error:', schemaError);
        missingColumns = ['id', 'full_name', 'email', 'username'];
      }

      // Prepare final diagnostic result
      this.diagnosticResult = {
        configurationValid: authConfigRetrieved && schemaValidationPassed,
        authConfigRetrieved,
        schemaValidationPassed,
        networkDiagnostics,
        missingRequiredColumns: missingColumns.length > 0 ? missingColumns : undefined,
        missingOptionalColumns: missingOptionalColumns.length > 0 ? missingOptionalColumns : undefined
      };

      this.initialized = true;
      console.log('🔍 Diagnostic Result:', this.diagnosticResult);

      // Enhance existing diagnostic result with more detailed network connectivity checks
      const enhancedNetworkChecks = [
        {
          name: 'Direct URL Connectivity',
          check: async () => {
            try {
              const response = await fetch(supabaseUrl, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
                signal: AbortSignal.timeout(5000)
              });

              return {
                success: response.type === 'opaque',
                message: 'Direct URL connectivity check passed',
                details: {
                  responseType: response.type,
                  status: response.status
                }
              };
            } catch (error) {
              console.error('Direct URL Check Error:', error);
              return {
                success: false,
                message: 'Direct URL connectivity check failed',
                details: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        },
        {
          name: 'REST API Endpoint Check',
          check: async () => {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                method: 'GET',
                headers: {
                  'apikey': supabaseAnonKey,
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              });

              return {
                success: response.ok,
                message: 'REST API endpoint check successful',
                details: {
                  status: response.status,
                  statusText: response.statusText
                }
              };
            } catch (error) {
              console.error('REST API Endpoint Check Error:', error);
              return {
                success: false,
                message: 'REST API endpoint check failed',
                details: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        }
      ];

      // Run enhanced network checks
      const networkCheckResults = await Promise.all(
        enhancedNetworkChecks.map(async (strategy) => {
          const result = await strategy.check();
          console.log(`🔍 ${strategy.name}:`, result.success ? '✅ Passed' : '❌ Failed');
          return result;
        })
      );

      // Update diagnostic result with network check details
      this.diagnosticResult = {
        ...this.diagnosticResult,
        enhancedNetworkConnectivity: {
          success: networkCheckResults.every(result => result.success),
          details: networkCheckResults
        }
      };

      // Comprehensive Supabase Project Diagnostic Function
      this.performSupabaseProjectDiagnostics = async () => {
        console.log('🔍 Starting Comprehensive Supabase Diagnostics...');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // Validate environment variables
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('❌ Critical Configuration Error', {
            supabaseUrlPresent: !!supabaseUrl,
            supabaseAnonKeyPresent: !!supabaseAnonKey
          });

          return {
            success: false,
            type: 'configuration_error',
            message: 'Missing Supabase environment variables',
            recommendations: [
              'Check .env file configuration',
              'Verify Supabase project credentials',
              'Regenerate Supabase API keys'
            ]
          };
        }

        // Advanced Connectivity Diagnostic Strategies
        const diagnosticStrategies = [
          {
            name: 'Direct URL Validation',
            check: async () => {
              try {
                const response = await fetch(supabaseUrl, {
                  method: 'HEAD',
                  mode: 'cors',
                  headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${supabaseAnonKey}`
                  }
                });

                return {
                  success: response.ok,
                  status: response.status,
                  headers: Object.fromEntries(response.headers.entries()),
                  message: response.ok 
                    ? 'Direct URL access successful' 
                    : `HTTP Error: ${response.status} ${response.statusText}`
                };
              } catch (error) {
                console.error('Direct URL Validation Error:', error);
                return {
                  success: false,
                  message: 'Direct URL access failed',
                  error: error instanceof Error ? error.message : 'Unknown error'
                };
              }
            }
          },
          {
            name: 'API Endpoint Connectivity',
            check: async () => {
              try {
                const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                  method: 'GET',
                  headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  }
                });

                return {
                  success: response.ok,
                  status: response.status,
                  message: response.ok 
                    ? 'API Endpoint accessible' 
                    : `Endpoint Error: ${response.status} ${response.statusText}`
                };
              } catch (error) {
                console.error('API Endpoint Connectivity Error:', error);
                return {
                  success: false,
                  message: 'API Endpoint inaccessible',
                  error: error instanceof Error ? error.message : 'Unknown error'
                };
              }
            }
          }
        ];

        // Execute Diagnostic Strategies
        const diagnosticResults = await Promise.all(
          diagnosticStrategies.map(async (strategy) => {
            const result = await strategy.check();
            console.log(`🔍 ${strategy.name}:`, result.success ? '✅ Passed' : '❌ Failed');
            return { ...result, strategyName: strategy.name };
          })
        );

        // Determine Overall Diagnostic Outcome
        const overallSuccess = diagnosticResults.every(result => result.success);

        return {
          success: overallSuccess,
          message: overallSuccess 
            ? 'Supabase project fully operational' 
            : 'Connectivity issues detected',
          diagnosticResults,
          recommendations: !overallSuccess ? [
            'Verify Supabase project status',
            'Check network connectivity',
            'Validate API credentials',
            'Review Supabase dashboard settings'
          ] : []
        };
      }

      return this.diagnosticResult;

    } catch (error) {
      console.error('❌ Unexpected Supabase Project Diagnostics Error:', error);
      
      this.diagnosticResult = {
        configurationValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
      
      return this.diagnosticResult;
    }
  }
}

// Export a function to get diagnostics
export async function performSupabaseProjectDiagnostics(forceRefresh = false) {
  const diagnostics = SupabaseDiagnostics.getInstance();
  return await diagnostics.performDiagnostics(forceRefresh);
}

// Run diagnostics on import
performSupabaseProjectDiagnostics().then(result => {
  console.log('Supabase Project Diagnostics Result:', result);
});
