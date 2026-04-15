import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "../types/database";

// Hardcoded fallbacks — EXPO_PUBLIC_* vars are inlined at build time by Metro,
// but may be undefined if the bundler didn't inject them (e.g. Android Studio builds).
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://tzyzaygqvxkazdgeyvha.supabase.co";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eXpheWdxdnhrYXpkZ2V5dmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDMxMzEsImV4cCI6MjA5MTY3OTEzMX0.KsfJOK_803UP_orXzBvWSIk95rsFs9AQtvFRQigvvoA";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function getSupabase() {
  return supabase;
}
