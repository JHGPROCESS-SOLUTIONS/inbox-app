"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) return setMsg("Wachtwoord moet minimaal 8 tekens zijn.");
    if (password !== password2) return setMsg("Wachtwoorden komen niet overeen.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) return setMsg(error.message);

    setMsg("Wachtwoord bijgewerkt. Je wordt doorgestuurd…");
    setTimeout(() => router.push("/inbox"), 800);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Nieuw wachtwoord instellen</h1>

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

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}