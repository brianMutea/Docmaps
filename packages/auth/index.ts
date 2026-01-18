// Authentication utilities for DocMaps
// This package provides unified Supabase client creation for browser and server

// Browser client (safe for client components)
export { createClient } from './supabase/client';

// Server client (server components only)
// Import separately: import { createServerClient } from '@docmaps/auth/server'

