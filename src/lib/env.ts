const requiredKeys = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

type SupabaseEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let cachedEnv: SupabaseEnv | null = null;

function requireEnv(key: (typeof requiredKeys)[number]): string {
  const value = import.meta.env[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      `[Supabase] Missing required environment variable: ${key}. Add it to your .env file.`,
    );
  }

  return value;
}

function getSupabaseEnv(): SupabaseEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const missingKeys = requiredKeys.filter((key) => {
    const value = import.meta.env[key];
    return typeof value !== "string" || !value.trim();
  });

  if (missingKeys.length) {
    throw new Error(
      `[Supabase] Missing required environment variable(s): ${missingKeys.join(", ")}. Add them to your .env file.`,
    );
  }

  cachedEnv = {
    supabaseUrl: requireEnv("VITE_SUPABASE_URL"),
    supabaseAnonKey: requireEnv("VITE_SUPABASE_ANON_KEY"),
  };

  return cachedEnv;
}

export { getSupabaseEnv };
