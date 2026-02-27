"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check of er een sessie is (na /auth/callback zou dit true moeten zijn)
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMsg("Reset-link is ongeldig of verlopen. Vraag opnieuw een reset aan.");
      }
    })();
  }, [supabase]);

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
        />
        <input
          type="password"
          placeholder="Herhaal nieuw wachtwoord"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Opslaan..." : "Wachtwoord opslaan"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}