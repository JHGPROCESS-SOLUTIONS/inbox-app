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
  const [info, setInfo] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError("Vul email en wachtwoord in.");
      return;
    }

    setSubmitting(true);

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

    setSubmitting(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    if (mode === "signup") {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setInfo("Account aangemaakt. Check je email om te bevestigen en log daarna in.");
        return;
      }
    }

    router.replace("/inbox");
    router.refresh();
  }

  async function onForgotPassword() {
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Vul eerst je email in, daarna kun je een reset aanvragen.");
      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      // recovery link gaat naar jouw reset page
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSendingReset(false);

    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Herstelmail verzonden. Check je inbox (en spam) en volg de link.");
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      {/* debug tag: mag, maar moet IN de component */}
      <div style={{ position: "fixed", top: 8, left: 8, fontSize: 12, color: "green" }}>
        BUILD: forgot-password-enabled-v1
      </div>

      <h1>{mode === "login" ? "Log in" : "Sign up"}</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, marginTop: 16 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {error && <div style={{ color: "red" }}>{error}</div>}
        {info && <div style={{ color: "green" }}>{info}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Bezig..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={sendingReset}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              color: "blue",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {sendingReset ? "Herstelmail versturen..." : "Wachtwoord vergeten?"}
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setInfo(null);
        }}
        style={{ marginTop: 12 }}
      >
        {mode === "login" ? "Switch to sign up" : "Switch to login"}
      </button>
    </div>
  );
}