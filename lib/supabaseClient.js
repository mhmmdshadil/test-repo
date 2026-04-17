import { createClient } from "@supabase/supabase-js";

// Lazy singleton — only instantiated at runtime (not build time),
// so Vercel's static analysis won't crash when env vars aren't present.
let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings (or .env.local locally)."
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return _supabase;
}

// Proxy so existing code can still use `supabase.from(...)` etc. unchanged
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getSupabase()[prop];
    },
  }
);
