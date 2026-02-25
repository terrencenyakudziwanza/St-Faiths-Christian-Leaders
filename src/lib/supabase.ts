import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

export const MEDIA_BUCKET = "media";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
