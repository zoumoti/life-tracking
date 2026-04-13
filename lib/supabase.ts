import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    // Lazy import to avoid SSR issues with AsyncStorage accessing window
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

// Convenience export for runtime usage
export const supabase = typeof window !== "undefined"
  ? getSupabase()
  : (null as unknown as SupabaseClient<Database>);
