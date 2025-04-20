import { createClient } from '@supabase/supabase-js';

// Use environment variables defined in `.env`
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is not defined. Check your .env file.");
    throw new Error("Missing Supabase configuration.");
}

// Determine the redirect URL for OAuth
// First check if we're in production or development
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const basePath = '/Vhack-2025';
const port = window.location.port ? `:${window.location.port}` : '';
const protocol = window.location.protocol;
const hostname = window.location.hostname;

// Build the redirect URL
const redirectTo = isLocalhost
  ? `${protocol}//${hostname}${port}${basePath}`
  : `${protocol}//${hostname}${basePath}`;

// Initialize Supabase client with OAuth redirect support
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Enable detecting OAuth tokens in URL
        flowType: 'implicit', // Use implicit flow for SPA
    },
    global: {
        headers: {
            'x-application-name': 'vhack-2025',
        },
    },
});

export default supabase;

