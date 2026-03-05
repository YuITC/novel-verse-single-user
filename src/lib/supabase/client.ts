// npm i @supabase/supabase-js @supabase/ssr
// npx supabase gen types typescript --project-id {...} --schema public > src/lib/supabase/database.types.ts

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
