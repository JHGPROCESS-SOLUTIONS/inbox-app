export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import ReviewPanel from "./review-panel";

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = params?.id;

  // HARD GUARD: als dit faalt, mag er NOOIT een supabase query komen
  if (!id || !isUuid(id)) {
    return (
      <div className="p-6">
        <Link href="/inbox">← Back</Link>
        <pre className="mt-4 rounded border bg-white p-4 text-sm">
{JSON.stringify({ step: "BAD_ID", id }, null, 2)}
        </pre>
      </div>
    );
  }

  const supabase = await supabaseServer();

  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;

  if (!user) {
    return (
      <div className="p-6">
        <Link href="/inbox">← Back</Link>
        <pre className="mt-4 rounded border bg-white p-4 text-sm">
{JSON.stringify({ step: "NO_USER", id }, null, 2)}
        </pre>
      </div>
    );
  }

  const membershipRes = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .limit(1);

  const tenant_id = membershipRes.data?.[0]?.tenant_id;

  if (!tenant_id) {
    return (
      <div className="p-6">
        <Link href="/inbox">← Back</Link>
        <pre className="mt-4 rounded border bg-white p-4 text-sm">
{JSON.stringify({ step: "NO_TENANT", id, user_id: user.id, membershipRes }, null, 2)}
        </pre>
      </div>
    );
  }

  // SUPER BELANGRIJK: we gebruiken hier alleen de `id` const hierboven
  const messageRes = await supabase
    .from("messages")
    .select(
      "id, tenant_id, subject, from_email, from_name, created_at, body_plain, status, draft_reply"
    )
    .eq("tenant_id", tenant_id)
    .eq("id", id)
    .maybeSingle();

  if (!messageRes.data) {
    return (
      <div className="p-6">
        <Link href="/inbox">← Back</Link>
        <pre className="mt-4 rounded border bg-white p-4 text-sm">
{JSON.stringify({ step: "NO_MESSAGE", used_id: id, tenant_id, messageRes }, null, 2)}
        </pre>
      </div>
    );
  }

  const message = messageRes.data;

  return (
    <div className="h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link href="/inbox" className="text-sm text-gray-500 hover:text-gray-800">
            ← Back to inbox
          </Link>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            {message.subject?.trim() || "(no subject)"}
          </h1>

          <div className="mt-2 text-sm text-gray-600">
            <div>
              From:{" "}
              {message.from_email
                ? `${message.from_name ? `${message.from_name} ` : ""}<${message.from_email}>`
                : "<>"}
            </div>
            <div>Received: {new Date(message.created_at).toLocaleString()}</div>
            <div className="mt-2">
              Status: <b>{message.status}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="rounded-xl border bg-white p-5">
          <div className="text-sm font-semibold text-gray-800">Original message</div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">
            {message.body_plain || "—"}
          </div>
        </section>

        <ReviewPanel
          messageId={message.id}
          status={message.status}
          initialDraft={message.draft_reply ?? ""}
        />
      </div>
    </div>
  );
}