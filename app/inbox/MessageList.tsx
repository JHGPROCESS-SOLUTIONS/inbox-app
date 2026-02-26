// app/inbox/MessageList.tsx
import { supabaseServer } from "@/lib/supabase/server";
import MessageListClient from "./MessageListClient";

export default async function MessageList() {
  const supabase = await supabaseServer();

  // user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) console.error("auth.getUser error:", userError);
  if (!user) return null;

  // tenant (simpel: 1e membership)
  const { data: membership, error: membershipError } = await supabase
    .from("tenant_members")
    .select("tenant_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) console.error("tenant_members error:", membershipError);

  if (!membership?.tenant_id) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Geen tenant gevonden
      </div>
    );
  }

  // counts (voor header)
  const [{ count: needsReviewCount }, { count: newCount }] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", membership.tenant_id)
      .eq("status", "NEEDS_REVIEW"),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", membership.tenant_id)
      .eq("status", "NEW"),
  ]);

  // messages (we halen NEW + NEEDS_REVIEW op, client filtert tabs)
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, subject, from_email, created_at, status")
    .eq("tenant_id", membership.tenant_id)
    .in("status", ["NEW", "NEEDS_REVIEW"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("messages query error:", error);
    return (
      <div className="p-4 text-sm text-red-500">
        Fout bij laden van berichten
      </div>
    );
  }

  return (
    <MessageListClient
      messages={messages ?? []}
      counts={{
        needsReview: needsReviewCount ?? 0,
        new: newCount ?? 0,
      }}
    />
  );
}