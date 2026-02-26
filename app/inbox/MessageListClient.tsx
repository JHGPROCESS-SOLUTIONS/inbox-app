"use client";

import { useMemo, useState } from "react";
import MessageListItem from "./MessageListItem";

type MessageRow = {
  id: string;
  subject: string | null;
  from_email: string | null;
  created_at: string | null;
  status: string | null;
};

export default function MessageListClient({
  messages,
  counts,
}: {
  messages: MessageRow[];
  counts: { needsReview: number; new: number };
}) {
  const [tab, setTab] = useState<"needs_review" | "all">("needs_review");

  const filtered = useMemo(() => {
    if (tab === "needs_review") {
      return messages.filter((m) => m.status === "NEEDS_REVIEW");
    }
    return messages;
  }, [messages, tab]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="text-lg font-semibold">Inbox</div>

        <div className="mt-1 text-sm text-gray-500">
          Needs review: {counts.needsReview} • New: {counts.new}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setTab("needs_review")}
            className={[
              "rounded-full px-3 py-1 text-sm",
              tab === "needs_review"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            ].join(" ")}
          >
            Needs review ({counts.needsReview})
          </button>

          <button
            onClick={() => setTab("all")}
            className={[
              "rounded-full px-3 py-1 text-sm",
              tab === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            ].join(" ")}
          >
            All ({messages.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {!filtered.length ? (
          <div className="p-4 text-sm text-gray-500">
            Geen berichten gevonden
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((m) => (
              <MessageListItem
                key={m.id}
                id={m.id}
                title={m.subject?.trim() || "(no subject)"}
                subtitle={m.from_email}
                date={m.created_at ?? undefined}
                status={m.status ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}