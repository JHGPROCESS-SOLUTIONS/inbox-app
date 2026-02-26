"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError("Vul email en wachtwoord in.");
      return;
    }

    const res =
      mode === "login"
        ? await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
          })
        : await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
          });

    if (res.error) {
      setError(res.error.message);
      return;
    }

    router.replace("/inbox");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h1>{mode === "login" ? "Log in" : "Sign up"}</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, marginTop: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        style={{ marginTop: 12 }}
      >
        {mode === "login" ? "Switch to sign up" : "Switch to login"}
      </button>
    </div>
  );
}