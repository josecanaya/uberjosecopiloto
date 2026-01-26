// Cliente de Supabase con service_role (solo para backend)
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // En build time, retornar un cliente dummy que fallará en runtime
    // pero permitirá que el build pase
    return createClient(
      "https://placeholder.supabase.co",
      "placeholder-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabase = getSupabaseClient();
