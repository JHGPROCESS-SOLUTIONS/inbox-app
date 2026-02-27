import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code"); // PKCE code flow
  const next = url.searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (code) {
    // Wisselt de code om voor een sessie + zet cookies
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect naar de echte pagina (bv /reset-password)
  return NextResponse.redirect(new URL(next, url.origin));
}