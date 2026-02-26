"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ReviewPanel({
  messageId,
  status,
  initialDraft,
}: {
  messageId: string;
  status: string;
  initialDraft: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [pending, startTransition] = useTransition();

  const canReview = status === "NEEDS_REVIEW";
  const changed = useMemo(() => (draft ?? "") !== (initialDraft ?? ""), [draft, initialDraft]);

  async function call(action: "save" | "approve") {
    const res = await fetch("/api/messages/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: messageId, action, draft_reply: draft }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(txt || "Error");
      return;
    }

    startTransition(() => {
      router.refresh(); // server data opnieuw ophalen
    });
  }

  // Niet NEEDS_REVIEW? dan tonen we alleen status info (clean)
  if (!canReview) {
    return (
      <section className="rounded-xl border bg-white p-5">
        <div className="text-sm font-semibold text-gray-800">Review</div>
        <div className="mt-2 text-sm text-gray-600">
          Dit bericht is momenteel <b>{status.replaceAll("_", " ")}</b>. Er zijn geen review-acties beschikbaar.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-800">Draft reply</div>
          <div className="mt-1 text-xs text-gray-500">
            Pas het concept aan en keur daarna goed om te verzenden.
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending || !changed}
            onClick={() => call("save")}
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              pending || !changed ? "opacity-50" : "hover:bg-gray-50",
            ].join(" ")}
          >
            Opslaan
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => call("approve")}
            className={[
              "rounded-lg bg-gray-900 px-3 py-2 text-sm text-white",
              pending ? "opacity-50" : "hover:bg-gray-800",
            ].join(" ")}
          >
            Goedkeuren & Verzenden
          </button>
        </div>
      </div>

      <textarea
        className="mt-4 w-full min-h-[240px] resize-y rounded-lg border p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-gray-200"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Schrijf hier het antwoord..."
      />
    </section>
  );
}