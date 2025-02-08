import { createClient } from '@supabase/supabase-js';

// Configuration for local PostgreSQL
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'adminpro_db',
  user: 'adminpro_user',
  password: '7OQYXHccuGsD5@R'
};

// Async function to execute database queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Execute query using Supabase client
    const { data, error } = await supabase.rpc('execute_custom_query', {
      p_query: query,
      p_params: params
    });

    if (error) {
      console.error('Database Query Error:', error);
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Database Query Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Utility functions for database operations
export const databaseUtils = {
  hashPassword: async (password: string): Promise<string> => {
    // Use Web Crypto API for secure hashing in browsers
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Generate a random salt
    const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(saltBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Combine password and salt
    const combinedBuffer = new Uint8Array([...saltBuffer, ...data]);

    // Hash using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Return salt:hash format
    return `${saltHex}:${hashHex}`;
  },

  verifyPassword: async (storedPassword: string, providedPassword: string): Promise<boolean> => {
    const [salt, originalHash] = storedPassword.split(':');
    
    const encoder = new TextEncoder();
    const saltBuffer = new Uint8Array(salt.match(/.{1,2}/g)!.map(hex => parseInt(hex, 16)));
    const passwordBuffer = encoder.encode(providedPassword);
    
    const combinedBuffer = new Uint8Array([...saltBuffer, ...passwordBuffer]);

    const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verifyHash = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return verifyHash === originalHash;
  },

  generateUUID: (): string => {
    // Use Web Crypto API for generating secure random UUID
    const randomBuffer = crypto.getRandomValues(new Uint8Array(16));
    
    // Set version (4) and variant bits
    randomBuffer[6] = (randomBuffer[6] & 0x0f) | 0x40; // version 4
    randomBuffer[8] = (randomBuffer[8] & 0x3f) | 0x80; // variant 10
    
    // Convert to hex string
    return Array.from(randomBuffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  sanitizeInput: (input: string): string => {
    // Remove any potentially harmful characters
    return input.replace(/[<>&'"]/g, '')
      .trim()
      .slice(0, 255); // Limit input length
  }
};

// Fallback Supabase configuration (for reference)
const supabaseUrl = 'http://localhost:5050'; // Local development URL
const supabaseAnonKey = 'local-dev-key'; // Placeholder key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 
      'x-application-name': 'AdminPro',
      'Origin': 'http://localhost:5050'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Global error logging
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof Error) {
    console.error(' Unhandled Promise Rejection:', event.reason);
  }
});
