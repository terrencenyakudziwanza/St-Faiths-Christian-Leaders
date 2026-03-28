import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

export const LEGACY_MEDIA_BUCKET = "media";
export const SEED_BUCKET = LEGACY_MEDIA_BUCKET;
export const CMS_BUCKET = LEGACY_MEDIA_BUCKET;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
