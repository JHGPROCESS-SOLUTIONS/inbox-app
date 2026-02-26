"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageStatus =
  | "NEW"
  | "CLASSIFYING"
  | "CLASSIFIED"
  | "NEEDS_REVIEW"
  | "READY_TO_SEND"
  | "SENDING"
  | "SENT"
  | "ERROR"
  | "IGNORED";

export default function MessageStatusButtons({
  id,
  status,
}: {
  id: string;
  status: MessageStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(nextStatus: MessageStatus) {
    setLoading(true);
    try {
      const res = await fetch("/messages/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(text);
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8, minWidth: 140 }}>
<div style={{ fontSize: 12, opacity: 0.7 }}>Current: {status}</div>
     <button disabled={loading || status === "NEW"} onClick={() => setStatus("NEW")}>
  New
</button>

<button
  disabled={loading || status === "NEEDS_REVIEW"}
  onClick={() => setStatus("NEEDS_REVIEW")}
>
  Needs review
</button>

<button
  disabled={loading || status === "CLASSIFIED"}
  onClick={() => setStatus("CLASSIFIED")}
>
  Done
</button>
    </div>
  );
}