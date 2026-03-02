import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Supabase stuurt meestal ?code=... terug (PKCE)
  const code = url.searchParams.get("code");

  // Waar willen we naartoe?
  const next = url.searchParams.get("next") ?? "/";

  const supabase = await supabaseServer();

  if (code) {
    // Zet de sessie in cookies (belangrijk voor /reset-password & middleware)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Als exchange faalt: terug naar login met fout
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
    }
  }

  // Redirect naar reset-password of home
  return NextResponse.redirect(new URL(next, url.origin));
}