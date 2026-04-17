import { createClient } from "@supabase/supabase-js";

// Server-side client using service role key — bypasses RLS for trusted API routes.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(
      `Missing server-side configuration: ${missing.join(", ")}. Please add them in Vercel/environment settings.`
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
