"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Maak supabase client 1x stabiel
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // In sommige setups komt Supabase recovery met hash params (#access_token=...)
    // In anderen met query params (?code=...)
    // Wij crashen niet als er niks is: we tonen gewoon een duidelijke melding.
    (async () => {
      setMsg(null);

      try {
        // 1) Als er een "code" in query zit (PKCE flow), wissel die om naar session
        const code = searchParams?.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
            setReady(true);
            return;
          }
        }

        // 2) Check of we nu een session hebben (recovery session)
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
          setReady(true);
          return;
        }

        setReady(true);
      } catch (e) {
        setMsg("Er ging iets mis bij het laden van de reset-pagina. Probeer opnieuw.");
        setReady(true);
      }
    })();
  }, [supabase, searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) {
      setMsg("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password !== password2) {
      setMsg("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg("Wachtwoord bijgewerkt. Je wordt doorgestuurd…");
    setTimeout(() => router.replace("/login"), 800);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Nieuw wachtwoord instellen</h1>

      {!ready ? (
        <p>Even laden…</p>
      ) : msg && msg.includes("ongeldig") ? (
        <div>
          <p style={{ color: "red" }}>{msg}</p>
          <button type="button" onClick={() => router.replace("/login")}>
            Terug naar login
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <input
              type="password"
              placeholder="Nieuw wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Herhaal nieuw wachtwoord"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Opslaan..." : "Wachtwoord opslaan"}
            </button>
          </form>

          {msg && <p style={{ marginTop: 12, color: msg.includes("bijgewerkt") ? "green" : "red" }}>{msg}</p>}
        </>
      )}
    </div>
  );
}