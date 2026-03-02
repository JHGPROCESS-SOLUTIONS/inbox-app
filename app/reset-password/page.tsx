"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function parseHash(hash: string) {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    type: params.get("type"),
  };
}

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const sp = useSearchParams();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const code = useMemo(() => sp.get("code"), [sp]);

  useEffect(() => {
    (async () => {
      setMsg(null);

      // 1) Als Supabase met ?code= komt: eerst via /auth/callback sessie-cookies zetten
      if (code) {
        router.replace(`/auth/callback?next=/reset-password`);
        return;
      }

      // 2) Als Supabase met #access_token=... komt: sessie zetten in browser
      const { access_token, refresh_token, type } = parseHash(window.location.hash);

      if (type === "recovery" && access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
          setReady(false);
          return;
        }

        // hash opruimen (netjes)
        window.history.replaceState({}, document.title, window.location.pathname);
        setReady(true);
        return;
      }

      // 3) Check: bestaat er al een sessie?
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
        setReady(false);
        return;
      }

      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) return setMsg("Wachtwoord moet minimaal 8 tekens zijn.");
    if (password !== password2) return setMsg("Wachtwoorden komen niet overeen.");
    if (!ready) return setMsg("Reset-sessie is niet actief. Open de reset-link opnieuw.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return setMsg(error.message);

    setMsg("Wachtwoord bijgewerkt. Je wordt doorgestuurd…");
    setTimeout(() => router.replace("/inbox"), 600);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Nieuw wachtwoord instellen</h1>

      {!ready ? (
        <p style={{ marginTop: 12 }}>{msg ?? "Reset-link controleren..."}</p>
      ) : (
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
          {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </form>
      )}
    </div>
  );
}